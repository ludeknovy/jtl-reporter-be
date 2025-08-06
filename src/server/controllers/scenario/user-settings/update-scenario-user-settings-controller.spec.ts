import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { db } from "../../../../db/db"
import { updateScenariosUserSettingsController } from "./update-scenario-user-settings-controller"
import { StatusCode } from "../../../utils/status-code"

jest.mock("../../../../db/db")

const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    return res
}

describe("updateScenariosUserSettingsController", () => {
    it("should update settings and respond with 204", async () => {
        const response = mockResponse()
        const request = {
            params: {
                projectName: "project-name",
                scenarioName: "scenario-name",
            },
            user: { userId: "userId" },
            body: {
                requestStats: {
                    samples: false,
                    avg: true,
                    min: false,
                    max: true,
                    p90: false,
                    p95: true,
                    p99: false,
                    throughput: true,
                    network: false,
                    errorRate: true,
                },
            },
        }

        ;(db.none as any).mockResolvedValueOnce()
        const querySpy = jest.spyOn(require("../../../queries/scenario"), "updateUserScenarioSettings")

        await updateScenariosUserSettingsController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response
        )

        expect(response.status).toHaveBeenCalledWith(StatusCode.NoContent)
        expect(response.send).toHaveBeenCalled()
        expect(querySpy).toHaveBeenCalledWith(
            request.params.projectName,
            request.params.scenarioName,
            request.user.userId,
            JSON.stringify(request.body.requestStats)
        )
    })
})
