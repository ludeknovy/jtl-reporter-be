import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { updateScenarioController } from "./update-scenario-controller"

jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}
describe("updateScenariosController", () => {
  it("should save the data into db", async () =>{
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../queries/scenario"), "updateScenario")
    const body = {
      thresholds: {
        enabled: true,
        percentile: 5,
        throughput: 5,
        errorRate: 4,
      },
      analysisEnabled: true,
      scenarioName: "test-scenario",
      deleteSamples: false,
      zeroErrorToleranceEnabled: false,
      keepTestRunsPeriod: 7,
      generateShareToken: true,
      labelFilterSettings: [],
      labelTrendChartSettings: {},
    }
    const request = {
      params: { projectName: "project", scenarioName: "test-scenario" },
      body,
    }
    await updateScenarioController(request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response)
    expect(response.send).toHaveBeenCalledTimes(1)
    expect(querySpy).toBeCalledWith("project", "test-scenario", "test-scenario",
      body.analysisEnabled, body.thresholds, body.deleteSamples, body.zeroErrorToleranceEnabled,
      body.keepTestRunsPeriod, body.generateShareToken, JSON.stringify(body.labelFilterSettings),
      JSON.stringify(body.labelTrendChartSettings))
    expect(response.send).toHaveBeenCalledTimes(1)
  })
})
