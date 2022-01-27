import { Response, NextFunction } from "express"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { deleteTokenController } from "./delete-token-controller"
import { db } from "../../../db/db"
import * as boom from "boom"

jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("deleteTokenController", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it("should call deleteToken query when admin role", async () => {
    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../queries/api-tokens"), "deleteToken")
    const request = {
      body: { id: "token-id" },
      user: {
        userId: "test",
        role: AllowedRoles.Admin,
      },
    }
    await deleteTokenController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(querySpy).toHaveBeenCalledTimes(1)
    expect(response.send).toHaveBeenCalledTimes(1)
  })

  it("should return forbidden when trying to delete api key that the user did not created as operator role",
    async () => {
    (db.one as any).mockResolvedValue({ exists: false })

    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const request = {
      body: { id: "token-id" },
      user: {
        userId: "test",
        role: AllowedRoles.Operator,
      },
    }

    await deleteTokenController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(nextFunction).toBeCalledWith(boom.forbidden())
  })

  it("should call deleteToken query for api key the user created as operator role", async () => {
    (db.one as any).mockResolvedValue({ exists: true })

    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../queries/api-tokens"), "deleteToken")
    const request = {
      body: { id: "token-id" },
      user: {
        userId: "test",
        role: AllowedRoles.Operator,
      },
    }

    await deleteTokenController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
      expect(querySpy).toHaveBeenCalledTimes(1)
      expect(response.send).toHaveBeenCalledTimes(1)
})
})
