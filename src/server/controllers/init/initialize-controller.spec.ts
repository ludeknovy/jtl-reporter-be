import { NextFunction, Response } from "express"
import { getInitController } from "./initialize-controller"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { db } from "../../../db/db"

jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.json = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}


describe("getInitController", () => {
  it("should return true if at least one user exists", async function () {
    (db.manyOrNone as any).mockResolvedValue(["test"])
    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const request = {}
    await getInitController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(response.json).toBeCalledWith({ initialized: true })
  })
  it("should return false if no user exists", async function () {
    (db.manyOrNone as any).mockResolvedValue([])
    const nextFunction: NextFunction = jest.fn()
    const response = mockResponse()
    const request = {}
    await getInitController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction)
    expect(response.json).toBeCalledWith({ initialized: false })
  })
})
