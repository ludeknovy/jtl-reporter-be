import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { createItemLinkController } from "./create-item-share-token-controller"
jest.mock("../../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("createItemLinkController", () => {
  it("should create new share token", async () => {
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../../queries/items"), "createShareToken")
    const generateTokenSpy = jest.spyOn(require("../utils/generateShareToken"), "generateShareToken")
    generateTokenSpy.mockReturnValueOnce("token")
    const request = {
      params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
      user: { userId: "userId" },
      body: {
          note: "note",
      },
    }
    await createItemLinkController(request as unknown as IGetUserAuthInfoRequest, response as unknown as Response)
    expect(querySpy).toHaveBeenCalledWith("project", "scenario", "id", "token", "userId", "note")
    expect(response.send).toHaveBeenCalledTimes(1)
    expect(generateTokenSpy).toHaveBeenCalledTimes(1)
  })
})
