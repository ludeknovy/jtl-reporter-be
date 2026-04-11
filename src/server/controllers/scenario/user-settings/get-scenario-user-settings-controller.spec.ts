/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { db } from "../../../../db/db"
import { getScenariosUserSettingsController } from "./get-scenario-user-settings-controller"

jest.mock("../../../../db/db")

const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    return res
}

describe("getScenariosUserSettingsController", () => {
    const baseRequest = {
        params: {
            projectName: "project-name",
            scenarioName: "scenario-name",
        },
        user: { userId: "userId" },
    }

    it("should return default settings when no user settings found", async () => {
        (db.oneOrNone as any).mockResolvedValueOnce(null)

        const response = mockResponse()
        await getScenariosUserSettingsController(
            baseRequest as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response
        )

        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            samples: true,
            avg: true,
            min: true,
            max: true,
            p90: true,
            p95: true,
            p99: true,
            throughput: true,
            network: true,
            errorRate: true,
        })
    })

    it("should return stored user settings when found", async () => {
        const userSettings = {
            request_stats_settings: {
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
        }
        ;(db.oneOrNone as any).mockResolvedValueOnce(userSettings)

        const response = mockResponse()
        await getScenariosUserSettingsController(
            baseRequest as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response
        )

        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith(userSettings.request_stats_settings)
    })

    it("should call getUserScenarioSettings with correct parameters", async () => {
        (db.oneOrNone as any).mockResolvedValueOnce(null)
        const getUserScenarioSettingsSpy = jest.spyOn(require("../../../queries/scenario"), "getUserScenarioSettings")

        const response = mockResponse()
        await getScenariosUserSettingsController(
            baseRequest as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response
        )

        expect(getUserScenarioSettingsSpy).toHaveBeenCalledWith(
            baseRequest.params.projectName,
            baseRequest.params.scenarioName,
            baseRequest.user.userId
        )
    })
})
