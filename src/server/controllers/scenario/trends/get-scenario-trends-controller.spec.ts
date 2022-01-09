import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { db } from "../../../../db/db"
import { getScenarioTrendsController } from "./get-scenario-trends-controller"

jest.mock("../../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("getScenarioTrendsController", function () {
  it("should return data", async function () {
    (db.any as any).mockResolvedValueOnce([{ overview: { bytesPerSecond: 100, bytesSentPerSecond: 200 }, id: "id1" }])

    const response = mockResponse()
    const request = {
      params: "scenario-name",
      projectName: "project-nsame",
    }
    await getScenarioTrendsController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response)
    expect(response.send).toBeCalledWith([{
      id: "id1",
      overview: {
        bytesPerSecond: 100,
        bytesSentPerSecond: 200,
        network: 300,
      },
    }])
  })
})
