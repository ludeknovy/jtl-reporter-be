import { Response, NextFunction } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getProjectController } from "./get-project-controller"
import { db } from "../../../db/db"
jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}


describe("getProjectController", () => {
  it("should return project settings", async function () {
    const responseStub = { name: "project" }
    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const request = {
      params: { projectName: "project" },
    };
    (db.one as any).mockResolvedValue(responseStub)
    await getProjectController(request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(response.send).toHaveBeenCalledTimes(1)
    expect(response.send).toBeCalledWith(responseStub)
  })
})
