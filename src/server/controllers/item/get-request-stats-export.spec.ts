import { Response, Request } from "express"
import { db } from "../../../db/db"
import { ExcelService } from "../../utils/excel-service"
import { StatusCode } from "../../utils/status-code"
import { getRequestStatsExportController } from "./get-request-stats-export-controller"


jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  res.writeHead = jest.fn().mockReturnValue(res)
  res.end = jest.fn().mockReturnValue(res)
  return res
}


describe("getRequestStatsExportController", () => {
    it("should retrun xls when there are request stats data", async () => {
        const response = mockResponse()
        const excelServiceSpy = jest.spyOn(ExcelService, "generateExcelBuffer");


        (db.oneOrNone as any).mockResolvedValue({ stats: [{
            label: "test", samples: 10, avgResponseTime: 10, minResponseTime: 1,
            maxResponseTime: 2, n0: 1, n5: 2, n9: 3,
            throughput: 10, bytesPerSecond: 1000, bytesSentPerSecond: 13331, errorRate: 3,
        }] })

        const request = {
            params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
          }

        await getRequestStatsExportController(request as unknown as Request, response as Response)

          expect(excelServiceSpy).lastCalledWith([
              { "P90 [ms]": 1, "P95 [ms]": 2, "P99 [ms]": 3, "avg [ms]": 10, "error rate": 3,
              label: "test", "max [ms]": 2, mbps: 0.11, "min [ms]": 1, "requests/s": 10, samples: 10 }])
        expect(response.end).toHaveBeenCalledTimes(1)
        expect(response.writeHead).toHaveBeenCalledWith(
            StatusCode.Ok,
            [
            ["Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"],
            ["Content-Disposition", "attachment; filename=requests-id.xlsx"]])
    })
})
