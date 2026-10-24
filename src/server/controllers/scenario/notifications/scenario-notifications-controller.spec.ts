import { Response } from "express"
import { db } from "../../../../db/db"
import { StatusCode } from "../../../utils/status-code"
import { createScenarioNotificationController } from "./create-notification-controller"
import { deleteScenarioNotificationController } from "./delete-scenario-notification-controller"
import { getScenarioNotificationsController } from "./get-notifications-controllers"

jest.mock("../../../../db/db")

const mockResponse = () => {
    const response: Partial<Response> = {}
    response.status = jest.fn().mockReturnValue(response)
    response.json = jest.fn().mockReturnValue(response)
    response.send = jest.fn().mockReturnValue(response)
    return response
}

describe("scenario notification controllers", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("creates a notification using the route and request-body fields", async () => {
        const response = mockResponse()
        const createNotificationSpy = jest.spyOn(require("../../../queries/scenario"), "createScenarioNotification")
        ;(db.none as jest.Mock).mockResolvedValue(undefined)

        await createScenarioNotificationController({
            body: { channel: "slack", name: "Release updates", type: "report_detail", url: "https://example.com" },
            params: { projectName: "project", scenarioName: "scenario" },
        } as any, response as Response)

        expect(createNotificationSpy).toHaveBeenCalledWith(
            "project", "scenario", "slack", "https://example.com", "Release updates", "report_detail")
        expect(db.none).toHaveBeenCalledTimes(1)
        expect(response.status).toHaveBeenCalledWith(StatusCode.Created)
        expect(response.send).toHaveBeenCalledTimes(1)
    })

    it("returns all notifications for a scenario", async () => {
        const response = mockResponse()
        const notifications = [{ id: "notification-id", name: "Release updates" }]
        const scenarioNotificationsSpy = jest.spyOn(require("../../../queries/scenario"), "scenarioNotifications")
        ;(db.manyOrNone as jest.Mock).mockResolvedValue(notifications)

        await getScenarioNotificationsController({
            params: { projectName: "project", scenarioName: "scenario" },
        } as any, response as Response)

        expect(scenarioNotificationsSpy).toHaveBeenCalledWith("project", "scenario")
        expect(response.status).toHaveBeenCalledWith(StatusCode.Ok)
        expect(response.json).toHaveBeenCalledWith(notifications)
    })

    it("deletes the notification identified by the route parameters", async () => {
        const response = mockResponse()
        const deleteNotificationSpy = jest.spyOn(require("../../../queries/scenario"), "deleteScenarioNotification")
        ;(db.none as jest.Mock).mockResolvedValue(undefined)

        await deleteScenarioNotificationController({
            params: { notificationId: "notification-id", projectName: "project", scenarioName: "scenario" },
        } as any, response as Response)

        expect(deleteNotificationSpy).toHaveBeenCalledWith("project", "scenario", "notification-id")
        expect(db.none).toHaveBeenCalledTimes(1)
        expect(response.status).toHaveBeenCalledWith(StatusCode.NoContent)
        expect(response.send).toHaveBeenCalledTimes(1)
    })
})
