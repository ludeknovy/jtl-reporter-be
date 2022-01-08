import { Response, NextFunction } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getTokensController } from "./get-tokens-controller"
jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("getTokenController", () => {
  it("should call get api token query", async () => {
    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../queries/api-tokens"), "getApiTokens")
    const request = {
    }
    await getTokensController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(querySpy).toHaveBeenCalledTimes(1)
    expect(response.send).toHaveBeenCalledTimes(1)
  })
})
