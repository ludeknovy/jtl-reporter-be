import { getItemLinksController } from "./get-item-share-tokens-controller"
import { Request, Response } from "express"
jest.mock("../../../../db/db")
const mockResponse = () => {
  const res: Partial<Response> = {}
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe("getItemLinksController", () => {
  it("should fetch data from db", async () => {
    const response = mockResponse()
    const querySpy = jest.spyOn(require("../../../queries/items"), "selectShareTokens")
    const request = {
      params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
    }
    await getItemLinksController(request as unknown as Request, response as unknown as Response)
    expect(querySpy).toHaveBeenCalledTimes(1)
    expect(response.send).toHaveBeenCalledTimes(1)
  })
})
