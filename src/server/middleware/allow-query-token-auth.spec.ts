import { allowItemQueryTokenAuth } from "./allow-item-query-token-auth"
import { IGetUserAuthInfoRequest } from "./request.model"
import { Response, NextFunction } from "express"

describe("allowQueryTokenAuth", () => {
  const nextFunction: NextFunction = jest.fn()
  const request: any = {}
  it("sets allowQueryAuth to true", async () => {
    await allowItemQueryTokenAuth(request as unknown as IGetUserAuthInfoRequest,
      {} as unknown as Response, nextFunction)
    expect(request.allowQueryAuth).toEqual(true)
    expect(nextFunction).toHaveBeenCalledTimes(1)
  })

})
