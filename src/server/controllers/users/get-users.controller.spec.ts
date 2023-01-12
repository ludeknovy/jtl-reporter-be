import { db } from "../../../db/db"
import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getUsersController } from "./get-users-controller"

jest.mock("../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.json = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("getUsersController", () => {
  it("should return query output", async function () {
    const users = ["test"];
    (db.query as any).mockResolvedValue(users)
    const response = mockResponse()
    const request = {}
    await getUsersController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response)
    expect(response.json).toBeCalledTimes(1)
    expect(response.json).toBeCalledWith(users)
  })
})
