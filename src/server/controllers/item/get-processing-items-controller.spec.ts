import { Response } from "express"
import { db } from "../../../db/db"
import { ReportStatus } from "../../queries/items.model"
import { StatusCode } from "../../utils/status-code"
import { getProcessingItemsController } from "./get-processing-items-controller"

jest.mock("../../../db/db")

const mockResponse = () => {
    const response: Partial<Response> = {}
    response.status = jest.fn().mockReturnValue(response)
    response.json = jest.fn().mockReturnValue(response)
    return response
}

describe("getProcessingItemsController", () => {
    it("groups in-progress and failed reports for the requested environment", async () => {
        const response = mockResponse()
        const inProgressItem = { id: "in-progress", reportStatus: ReportStatus.InProgress }
        const failedItem = { id: "failed", reportStatus: ReportStatus.Error }
        ;(db.any as jest.Mock).mockResolvedValue([
            inProgressItem,
            failedItem,
            { id: "ready", reportStatus: ReportStatus.Ready },
        ])
        const querySpy = jest.spyOn(require("../../queries/scenario"), "getProcessingItems")

        await getProcessingItemsController({
            params: { projectName: "project", scenarioName: "scenario" },
            query: { environment: "production" },
        } as any, response as Response)

        expect(querySpy).toHaveBeenCalledWith("project", "scenario", "production")
        expect(response.status).toHaveBeenCalledWith(StatusCode.Ok)
        expect(response.json).toHaveBeenCalledWith({ failed: [failedItem], inprogress: [inProgressItem] })
    })
})
