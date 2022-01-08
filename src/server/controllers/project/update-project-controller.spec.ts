import { Response, NextFunction } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { updateProjectController } from "./update-project-controller"
jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}


describe("updateProjectController", () => {
  it("should return project settings", async function () {
    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../queries/projects"), "updateProjectName")

    const request = {
      params: { projectName: "project" },
      body: { projectName: "newProjectName", topMetricsSettings: { errorRate: true } },
    }
    await updateProjectController(request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(response.send).toHaveBeenCalledTimes(1)
    expect(querySpy).toBeCalledWith("project", "newProjectName", { errorRate: true })
  })
})
