import { Response } from "express"
import { AllowedRoles } from "../../middleware/authorization-middleware"
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
  it("should call getApiToken query when admin role", async () => {
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../queries/api-tokens"), "getApiTokens")
    const request = {
      user: {
        role: AllowedRoles.Admin,
      },
    }
    await getTokensController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response)
    expect(querySpy).toHaveBeenCalledTimes(1)
    expect(response.send).toHaveBeenCalledTimes(1)
  })

  it("should call getOnlyMyApiTokens query when operator role", async () => {
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../queries/api-tokens"), "getOnlyMyApiTokens")
    const request = {
      user: {
        role: AllowedRoles.Operator,
      },
    }
    await getTokensController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response)
    expect(querySpy).toHaveBeenCalledTimes(1)
    expect(response.send).toHaveBeenCalledTimes(1)
  })
})
