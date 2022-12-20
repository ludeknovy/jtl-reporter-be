import { Response, NextFunction } from "express"
import { ItemStatus, ReportStatus } from "../../queries/items.model"
import { transformDataForDb } from "../../data-stats/prepare-data"
import { db } from "../../../db/db"
import { createNewItem, createShareToken, updateItem } from "../../queries/items"
import * as multer from "multer"
import * as boom from "boom"
import * as fs from "fs"
import * as csv from "fast-csv"
import { logger } from "../../../logger"
import { itemDataProcessing } from "./shared/item-data-processing"
import * as pgp from "pg-promise"
import { processMonitoringCsv } from "./utils/process-monitoring-csv"
import { StatusCode } from "../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { scenarioGenerateToken } from "../../queries/scenario"
import { generateShareToken } from "./utils/generateShareToken"
import { upsertScenario } from "./shared/upsert-scenario"

const pg = pgp()

const upload = multer(
  {
    dest: "./uploads",
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    limits: { fieldSize: 2048 * 1024 * 1024 },
  }).fields([
  { name: "kpi", maxCount: 1 },
  { name: "monitoring", maxCount: 1 },
])

const SECONDS_DIVISOR = 1000

export const createItemController = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  // eslint-disable-next-line complexity
  upload(req, res, async error => {
    const HOSTNAME_LENGTH = 200
    const { environment, note, status = ItemStatus.None, hostname, name } = req.body
    if (!req.files) {
      return next(boom.badRequest())
    }
    const { kpi, monitoring } = req.files as { kpi: unknown; monitoring: unknown}
    const { scenarioName, projectName } = req.params
    if (error) {
      return next(boom.badRequest(error.message))
    }
    if (!kpi) {
      return next(boom.badRequest("no file provided"))
    }
    if (!environment) {
      return next(boom.badRequest("environment is required"))
    }
    if (!Object.values(ItemStatus).some(_ => _ === status)) {
      return next(boom.badRequest("invalid status type"))
    }
    if (hostname && hostname.lenght > HOSTNAME_LENGTH) {
      return next(boom.badRequest("too long hostname. max length is 200."))
    }
    logger.info(`Starting new item processing for scenario: ${scenarioName}`)
    try {

      const kpiFilename = kpi[0]?.path
      const monitoringFileName = monitoring?.[0]?.path
      let tempBuffer = []

      await upsertScenario(projectName, scenarioName)

      const item = await db.one(createNewItem(
        scenarioName,
        null,
        environment,
        note,
        status,
        projectName,
        hostname,
        ReportStatus.InProgress,
        name
      ))

      const {
          generate_share_token: shouldGenerateToken,
          label_filter_settings: labelFilterSettings,
        } = await db.one(scenarioGenerateToken(projectName, scenarioName))
      let shareToken
      if (shouldGenerateToken) {
        shareToken = generateShareToken()
        await db.none(createShareToken(projectName, scenarioName, item.id,
          shareToken, req.user.userId, "automatically generated token"))
      }


      const itemId = item.id

      res.status(StatusCode.Ok).send({ itemId, shareToken })

      const columnSet = new pg.helpers.ColumnSet([
        "elapsed", "success", "bytes", "label",
        {
          name: "timestamp",
          prop: "timeStamp",
        },
        {
          name: "sent_bytes",
          prop: "sentBytes",
        },
        {
          name: "connect",
          prop: "Connect",
        }, {
          name: "hostname",
          prop: "Hostname",
          def: null,
        }, {
          name: "status_code",
          prop: "responseCode",
        },
        {
          name: "all_threads",
          prop: "allThreads",
        },
        {
          name: "grp_threads",
          prop: "grpThreads",
        }, {
          name: "latency",
          prop: "Latency",
        },
        {
          name: "response_message",
          prop: "responseMessage",
        },
        {
          name: "item_id",
          prop: "itemId",
        },
        {
          name: "sut_hostname",
          prop: "sutHostname",
          def: null,
        },
        {
          name: "failure_message",
          prop: "failureMessage",
          def: null,
        },
      ], { table: new pg.helpers.TableName({ table: "samples", schema: "jtl" }) })


      logger.info(`Starting KPI file streaming and saving to db, item_id: ${itemId}`)
      const parsingStart = Date.now()

      await processMonitoringCsv(monitoringFileName, itemId)
      const BUFFER_SIZE = 10000
      const csvStream = fs.createReadStream(kpiFilename)
        .pipe(csv.parse({ headers: true }))
        .on("data", async row => {
          if (tempBuffer.length === BUFFER_SIZE) {
            csvStream.pause()
            const query = pg.helpers.insert(tempBuffer, columnSet)
            await db.none(query)

            tempBuffer = []
            csvStream.resume()
          }
          const data = transformDataForDb(row, itemId, labelFilterSettings)
          if (data) {
            return tempBuffer.push(data)
          }

        })
        .on("end", async (rowCount: number) => {
          try {
            await db.none(pg.helpers.insert(tempBuffer, columnSet))

            fs.unlinkSync(kpiFilename)

            logger.info(`Parsed ${rowCount} records in ${(Date.now() - parsingStart) / SECONDS_DIVISOR } seconds`)
            await itemDataProcessing({
              itemId,
              projectName, scenarioName,
            })
            logger.info(`Done ${rowCount} in ${(Date.now() - parsingStart) / SECONDS_DIVISOR } seconds`)

          } catch(onEndError) {
            await db.none(updateItem(itemId, ReportStatus.Error, null))
            logger.error(`Error while processing item: ${itemId}: ${onEndError}`)
          }
        })
        .on("error", async (onErrorError) => {
          await db.none(updateItem(itemId, ReportStatus.Error, null))
          logger.error(`Not valid csv file provided: ${onErrorError}`)
        })
    } catch(e) {
      logger.error(e)
      return next(boom.internal("Error while reading provided file"))
    }
  })
}

