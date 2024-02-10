import { Response, NextFunction } from "express"
import { ItemStatus, ReportStatus } from "../../queries/items.model"
import { transformDataForDb } from "../../data-stats/prepare-data"
import { db } from "../../../db/db"
import { createNewItem, createShareToken, samplesColumnSet } from "../../queries/items"
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
import {
    ENVIRONMENT_MAX_LENGTH,
    HOSTNAME_MAX_LENGTH,
    NOTE_MAX_LENGTH,
    RESOURCES_LINK_MAX_LENGTH,
    TEST_NAME_MAX_LENGTH,
} from "./create-item-const"
import { AnalyticsEvent } from "../../utils/analytics/anyltics-event"
import { ALLOWED_PERIOD } from "./shared/constants"
import { UnlinkingFileException } from "../../errors/unlinking-file-exception"
import { DataStreamingToDatabaseException } from "../../errors/data-streaming-to-database-exception"
import { DataParsingException } from "../../errors/data-parsing-exception"
import { itemErrorHandler } from "./shared/item-error-handler"

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
        const {
            environment,
            note,
            status = ItemStatus.None,
            hostname,
            name,
            resourcesLink,
            keepTestRunsPeriod,
        } = req.body
        if (!req.files) {
            return next(boom.badRequest())
        }
        const { kpi, monitoring } = req.files as { kpi: unknown; monitoring: unknown }
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
        if (keepTestRunsPeriod) {
            const keepTestRunsPeriodError = checkKeepTestRunsPeriod(keepTestRunsPeriod)
            if (keepTestRunsPeriodError) {
                return next(keepTestRunsPeriodError)
            }
        }
        const failedValidations = checkFieldsLength([
            { name: "environment", value: environment, maxLength: ENVIRONMENT_MAX_LENGTH },
            { name: "name", value: name, maxLength: TEST_NAME_MAX_LENGTH },
            { name: "resourcesLink", value: resourcesLink, maxLength: RESOURCES_LINK_MAX_LENGTH },
            { name: "note", value: note, maxLength: NOTE_MAX_LENGTH },
            { name: "hostname", value: hostname, maxLength: HOSTNAME_MAX_LENGTH },
        ])
        if (failedValidations?.length > 0) {
            return next(boom.badRequest(`The following fields are too long: ${failedValidations.join(", ")}`))
        }

        AnalyticsEvent.reportProcessingStarted()
        logger.info(`Starting new item processing for scenario: ${scenarioName}`)
        try {

            const kpiFilename = kpi[0]?.path
            const monitoringFileName = monitoring?.[0]?.path
            let tempBuffer = []

            await upsertScenario(projectName, scenarioName, keepTestRunsPeriod)

            const item = await db.one(createNewItem(
                scenarioName,
                null,
                environment,
                note,
                status,
                projectName,
                hostname,
                ReportStatus.InProgress,
                name, resourcesLink
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
            res.status(StatusCode.Ok).json({ itemId, shareToken })

            logger.info(`Starting KPI file streaming and saving to db, item_id: ${itemId}`)
            const parsingStart = Date.now()

            await processMonitoringCsv(monitoringFileName, itemId)
            const BUFFER_SIZE = 10000
            const csvStream = fs.createReadStream(kpiFilename)
                .pipe(csv.parse({ headers: true }))
                .on("data", async row => {
                    try {
                        if (tempBuffer.length === BUFFER_SIZE) {
                            csvStream.pause()
                            await injectDataIntoDatabase(tempBuffer)
                            tempBuffer = []
                            csvStream.resume()
                        }
                        const data = transformDataForDb(row, itemId, labelFilterSettings)
                        if (data) {
                            return tempBuffer.push(data)
                        }
                    } catch(dataProcessingError) {
                        if (dataProcessingError instanceof DataStreamingToDatabaseException) {
                            csvStream.destroy(dataProcessingError)
                        } else {
                            csvStream.destroy(new DataParsingException(dataProcessingError))
                        }
                    }
                })
                .on("end", async (rowCount: number) => {
                    try {
                        await injectDataIntoDatabase(tempBuffer)
                        removeUploadedFile(kpiFilename)
                        // eslint-disable-next-line max-len
                        logger.info(`Parsed ${rowCount} records in ${(Date.now() - parsingStart) / SECONDS_DIVISOR} seconds`)
                        await itemDataProcessing({
                            itemId,
                            projectName, scenarioName,
                        })
                        logger.info(`Done ${rowCount} in ${(Date.now() - parsingStart) / SECONDS_DIVISOR} seconds`)

                    } catch(onEndError) {
                        await handleError(itemId, kpiFilename, onEndError)
                    }
                })
                .on("error", async (processingError) => {
                    logger.info(`File processing was aborted because of an error, item_id: ${itemId}`)
                    await handleError(itemId, kpiFilename, processingError)
                })
        } catch(e) {
            logger.error(e)
            return next(boom.internal("Error while reading provided file"))
        }
    })
}

const checkFieldsLength = (properties: Array<{ name: string; value: any; maxLength: number }>): string[] => {
    const failedValidations = []
    properties.forEach(property => {
        if (property.value && property.value.length > property.maxLength) {
            failedValidations.push(JSON.stringify({ fieldName: property.name, maxLength: property.maxLength }))
        }
    })
    return failedValidations
}

export const checkKeepTestRunsPeriod = (keepTestRunsPeriod): boom => {
    try {
        const keepTestRunsPeriodNumber = parseInt(keepTestRunsPeriod, 10)
        if (isNaN(keepTestRunsPeriodNumber)) {
            return boom.badRequest("keepTestRunsPeriod - only numbers are allowed")
        }
        const allowedValue = ALLOWED_PERIOD.find(val => val === keepTestRunsPeriodNumber)
        if (!allowedValue) {
            return boom.badRequest(`invalid value, allowed values are: ${ALLOWED_PERIOD}`)
        }
        return
    } catch(e) {
        return boom.badRequest("keepTestRunsPeriod - only numbers are allowed")
    }
}

const removeUploadedFile = (filename: string) => {
    try {
        logger.info(`Deleting file: ${filename}`)
        fs.unlinkSync(filename)
    } catch(e) {
        throw new UnlinkingFileException(e)
    }

}

const injectDataIntoDatabase = async (data: any[]) => {
    try {
        const query = pg.helpers.insert(data, samplesColumnSet)
        await db.none(query)
    } catch(e) {
        throw new DataStreamingToDatabaseException(e)
    }
}

const handleError = async (itemId: string, kpiFilename: string, processingError: Error) => {
    await itemErrorHandler(itemId, processingError)
    try {
        removeUploadedFile(kpiFilename)
    } catch(e) {
        logger.error(`File ${kpiFilename} does not exist anymore`)
    }
}
