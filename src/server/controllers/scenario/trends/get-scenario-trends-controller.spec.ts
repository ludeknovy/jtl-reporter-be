import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { db } from "../../../../db/db"
import { getScenarioTrendsController } from "./get-scenario-trends-controller"

jest.mock("../../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.json = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("getScenarioTrendsController", function () {
  it("should return data", async function () {
    (db.any as any).mockResolvedValueOnce([
      { overview: { bytesPerSecond: 100, bytesSentPerSecond: 200, startDate: "2022-02-11T08:33:02.920Z" }, id: "id2" },
      { overview: { bytesPerSecond: 100, bytesSentPerSecond: 200, startDate: "2021-11-29T21:25:57.623Z" }, id: "id1" },
    ])

    const response = mockResponse()
    const request = {
      params: "scenario-name",
      projectName: "project-name",
    }
    await getScenarioTrendsController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response)

    expect(response.json).toBeCalledWith([{
      id: "id1",
      overview: {
        bytesPerSecond: 100,
        bytesSentPerSecond: 200,
        network: 300,
        startDate: "2021-11-29T21:25:57.623Z",
      },
    }, {
      id: "id2",
      overview: {
        bytesPerSecond: 100,
        bytesSentPerSecond: 200,
        network: 300,
        startDate: "2022-02-11T08:33:02.920Z",
      },
    }])
  })
})
