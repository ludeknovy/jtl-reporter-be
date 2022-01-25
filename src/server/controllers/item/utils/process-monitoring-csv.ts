import * as fs from "fs"
import * as csv from "fast-csv"
import * as pgp from "pg-promise"
import { logger } from "../../../../logger"
import { transformMonitoringDataForDb } from "../../../data-stats/prepare-data"
import { db } from "../../../../db/db"

const pg = pgp()
const BUFFER_SIZE = 1000


export const processMonitoringCsv = (filename: string, itemId: string) => {
  if (!filename) {
    return
  }
  let tempBuffer = []
  logger.info(`Starting monitoring csv processing, itemId: ${itemId}`)
  const columnSet = new pg.helpers.ColumnSet([
    "timestamp", "cpu", "name", "mem", {
      name: "item_id",
      prop: "itemId",
    },
  ], { table: new pg.helpers.TableName({ table: "monitor", schema: "jtl" }) })
  const csvStream = fs.createReadStream(filename)
    .pipe(csv.parse({ headers: true }))
    .on("data", async row => {
      if (tempBuffer.length === (BUFFER_SIZE)) {
        csvStream.pause()
        const query = pg.helpers.insert(tempBuffer, columnSet)
        await db.none(query)

        tempBuffer = []
        csvStream.resume()
      }
      const data = transformMonitoringDataForDb(row, itemId)
      if (data) {
        return tempBuffer.push(data)
      }

    })
    .on("end", async (rowCount: number) => {
      try {
        await db.none(pg.helpers.insert(tempBuffer, columnSet))

        fs.unlinkSync(filename)

        logger.info(`Parsed ${rowCount} monitoring records`)
      } catch(error) {
        logger.error(`Error while processing monitoring data, itemId - ${itemId}: ${error}`)
      }
    })
    .on("error", (error) => {
      logger.error(`Not valid monitoring csv file provided: ${error}`)
    })
}
