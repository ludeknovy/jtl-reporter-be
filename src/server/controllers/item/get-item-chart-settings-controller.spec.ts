import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getItemChartSettingsController } from "./get-item-chart-settings-controller"
jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("getItemChartSettingsController", () => {
  it("should fetch data from db", async () => {
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../queries/items"), "getItemChartSettings")
    const request = {
      params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
      user: { userId: "testUser" },
    }
    await getItemChartSettingsController(request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response)
    expect(querySpy).toHaveBeenCalledTimes(1)
    expect(response.send).toHaveBeenCalledTimes(1)
  })
})
