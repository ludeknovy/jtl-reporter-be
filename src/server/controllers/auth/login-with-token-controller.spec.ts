import { NextFunction, Response } from "express"
import { db } from "../../../db/db"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { passwordMatch } from "./helper/passwords"
import { loginWithTokenController } from "./login-with-token-controller"

jest.mock("../../../db/db")
jest.mock("./helper/passwords")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("loginWithTokenController", () => {
  it("should return jwt token if valid token provided", async function () {
    (db.query as any).mockResolvedValue([{ created_by: "test" }])
    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const request = {
      body: {
        username: "test",
        password: "password",
      },
    }
    await loginWithTokenController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(response.send).toBeCalledWith(
      expect.objectContaining({
        jwtToken: expect.any(String),
      }))
  })
  it("should return unauthorized error if invalid token provided", async function () {
    const boomSpy = jest.spyOn(require("boom"), "unauthorized");
    (db.query as any).mockResolvedValue([])
    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const request = {
      body: {
        token: "test",
      },
    }
    await loginWithTokenController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(nextFunction).toHaveBeenCalledTimes(1)
    expect(boomSpy).toHaveBeenCalledTimes(1)
  })
})
