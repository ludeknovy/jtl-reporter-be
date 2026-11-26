import { Response } from "express"
import { db } from "../../../db/db"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { StatusCode } from "../../utils/status-code"
import { getProjectStatsController } from "./get-projects-stats-controller"

jest.mock("../../../db/db")

const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}

describe("getProjectStatsController", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("should scope dashboard stats to the authenticated user", async () => {
        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../queries/items"), "dashboardStats");
        (db.one as any).mockResolvedValueOnce({
            avgVu: "25",
            avgDuration: "10",
            totalDuration: "30",
            totalCount: "3",
        })

        const request = { user: { userId: "user-123" } }
        await getProjectStatsController(request as unknown as IGetUserAuthInfoRequest, response as unknown as Response)

        expect(querySpy).toHaveBeenCalledWith("user-123")
        expect(response.status).toHaveBeenCalledWith(StatusCode.Ok)
        expect(response.json).toHaveBeenCalledWith({
            avgVu: 25,
            avgDuration: 10,
            totalDuration: 30,
            totalRunCount: 3,
        })
    })

    it("should return zeros when user has no accessible runs", async () => {
        const response = mockResponse();
        (db.one as any).mockResolvedValueOnce({
            avgVu: null,
            avgDuration: null,
            totalDuration: null,
            totalCount: "0",
        })

        const request = { user: { userId: "user-no-access" } }
        await getProjectStatsController(request as unknown as IGetUserAuthInfoRequest, response as unknown as Response)

        expect(response.status).toHaveBeenCalledWith(StatusCode.Ok)
        expect(response.json).toHaveBeenCalledWith({
            avgVu: 0,
            avgDuration: 0,
            totalDuration: 0,
            totalRunCount: 0,
        })
    })
})
