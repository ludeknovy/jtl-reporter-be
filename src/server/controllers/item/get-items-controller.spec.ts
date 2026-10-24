import { Response } from "express"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"
import { getItemsController } from "./get-items-controller"

jest.mock("../../../db/db")

const PAGE_LIMIT = 10
const PAGE_OFFSET = 5

const mockResponse = () => {
    const response: Partial<Response> = {}
    response.status = jest.fn().mockReturnValue(response)
    response.json = jest.fn().mockReturnValue(response)
    return response
}

describe("getItemsController", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("returns paginated items and converts nullable environment and base flags", async () => {
        const response = mockResponse()
        ;(db.one as jest.Mock).mockResolvedValue({ total: "2" })
        ;(db.any as jest.Mock).mockResolvedValue([{ base: null }, { base: true }])
        const countQuerySpy = jest.spyOn(require("../../queries/scenario"), "itemsForScenarioCount")
        const findQuerySpy = jest.spyOn(require("../../queries/scenario"), "findItemsForScenario")

        await getItemsController({
            params: { projectName: "project", scenarioName: "scenario" },
            query: { environment: "", limit: PAGE_LIMIT, offset: PAGE_OFFSET },
        } as any, response as Response)

        expect(countQuerySpy).toHaveBeenCalledWith("project", "scenario", null)
        expect(findQuerySpy).toHaveBeenCalledWith("project", "scenario", null, PAGE_LIMIT, PAGE_OFFSET)
        expect(response.status).toHaveBeenCalledWith(StatusCode.Ok)
        expect(response.json).toHaveBeenCalledWith({
            data: [{ base: false }, { base: true }],
            name: "scenario",
            total: 2,
        })
    })
})
