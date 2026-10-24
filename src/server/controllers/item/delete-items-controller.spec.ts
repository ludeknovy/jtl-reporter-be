import { Response } from "express"
import { db } from "../../../db/db"
import { logger } from "../../../logger"
import { StatusCode } from "../../utils/status-code"
import { deleteItemsController } from "./delete-items-controller"

jest.mock("../../../db/db")
jest.mock("../../../logger")

const mockResponse = () => {
  const response: Partial<Response> = {}
  response.status = jest.fn().mockReturnValue(response)
  response.send = jest.fn().mockReturnValue(response)
  return response
}

describe("deleteItemsController", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("deletes the requested items and returns no content", async () => {
    const itemIds = ["cc784cb8-4d70-4ad0-99f1-c0ee7b0e9c65", "8a2ec6c4-2f1b-4f4a-8933-98232ac208c1"]
    const response = mockResponse()
    const deleteItemsSpy = jest.spyOn(require("../../queries/items"), "deleteItems")
    ;(db.any as jest.Mock).mockResolvedValue([])

    await deleteItemsController({
      params: { projectName: "project", scenarioName: "scenario" },
      body: { itemIds },
    } as any, response as Response)

    expect(deleteItemsSpy).toHaveBeenCalledWith("project", "scenario", itemIds)
    expect(logger.info).toHaveBeenCalledWith(`Items ${itemIds.join(", ")} deleted.`)
    expect(response.status).toHaveBeenCalledWith(StatusCode.NoContent)
    expect(response.send).toHaveBeenCalledTimes(1)
  })
})
