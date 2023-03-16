import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { db } from "../../../../db/db"
import { postScenarioTrendsSettings } from "./update-scenario-trends-settings-controller"
import { StatusCode } from "../../../utils/status-code"

jest.mock("../../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    return res
}

describe("updateScenarioTrendsSettings", function () {
    it("should update settings", async function () {
        const response = mockResponse()
        const request = {
            params: {
                scenarioName:  "scenario-name",
                projectName: "project-name",
            },
            user: { userId: "userId" },
            body: {
                aggregatedTrends: false,
                labelMetrics: {
                    errorRate: true,
                    percentile90: true,
                    throughput: false,
                },
            },
        };

        (db.none as any).mockResolvedValueOnce()
        const querySpy = jest.spyOn(require("../../../queries/scenario"), "updateUserScenarioTrendsSettings")

        await postScenarioTrendsSettings(request as unknown as IGetUserAuthInfoRequest, response as unknown as Response)
        expect(response.status).toBeCalledWith(StatusCode.NoContent)
        expect(querySpy).toHaveBeenCalledWith(request.params.projectName,
            request.params.scenarioName, "userId", JSON.stringify(request.body))
    })
    it("should not update settings when more than two metrics provided", async function () {
        const response = mockResponse()
        const request = {
            params: {
                scenarioName:  "scenario-name",
                projectName: "project-name",
            },
            user: { userId: "userId" },
            body: {
                aggregatedTrends: false,
                labelMetrics: {
                    errorRate: true,
                    percentile90: true,
                    throughput: true,
                },
            },
        }

        await postScenarioTrendsSettings(request as unknown as IGetUserAuthInfoRequest, response as unknown as Response)
        expect(response.status).toBeCalledWith(StatusCode.BadRequest)
        expect(response.send).toHaveBeenCalledWith("Max 2 metrics allowed")
    })
})
