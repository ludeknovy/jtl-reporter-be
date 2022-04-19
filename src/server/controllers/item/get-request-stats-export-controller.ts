import { Request, Response } from "express"
import { db } from "../../../db/db"
import { roundNumberTwoDecimals } from "../../data-stats/helper/stats-fc"
import { findRequestStats } from "../../queries/items"
import { ExcelService } from "../../utils/excel-service"
import { StatusCode } from "../../utils/status-code"

const EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"

export const getRequestStatsExportController = async (req: Request, res: Response) => {
    const { itemId } = req.params
    const { stats } = await db.oneOrNone(findRequestStats(itemId))

    const exportData = stats.map((label) =>
      ({ label: label.label, samples: label.samples, "avg [ms]": label.avgResponseTime,
       "min [ms]": label.minResponseTime, "max [ms]": label.maxResponseTime, "P90 [ms]": label.n0,
       "P95 [ms]": label.n5, "P99 [ms]": label.n9, "reqs/s": label.throughput,
       "network [mbps]": roundNumberTwoDecimals(bytesToMbps(label.bytesPerSecond + label.bytesSentPerSecond)),
       "error rate [%]": label.errorRate }))

    const excelData = ExcelService.generateExcelBuffer(exportData)

    res.writeHead(StatusCode.Ok, [
        ["Content-Type", EXCEL_TYPE],
        ["Content-Disposition", `attachment; filename=requests-${itemId}.xlsx`],
    ])
    res.end(Buffer.from(excelData, "base64"))
}


export const bytesToMbps = (bytes: number): number => {
    const MBPS = 8.0E-6
    return bytes * MBPS
  }
