import { Response } from "express"
import { AnalyticsEvent } from "../../utils/analytics/anyltics-event"
import { StatusCode } from "../../utils/status-code"
import { trackAnalyticsEventController } from "./track-analytics-event-controller"

describe("trackAnalyticsEventController", () => {
    const response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
    } as unknown as Response

    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it("tracks a report view and returns no content", async () => {
        const trackSpy = jest.spyOn(AnalyticsEvent, "trackUiEvent").mockResolvedValueOnce()

        await trackAnalyticsEventController(
            { body: { event: "reportViewed" } } as any,
            response)

        expect(trackSpy).toHaveBeenCalledWith("reportViewed", {})
        expect(response.status).toHaveBeenCalledWith(StatusCode.NoContent)
        expect(response.send).toHaveBeenCalledTimes(1)
    })

    it("passes comparison type to the analytics layer", async () => {
        const trackSpy = jest.spyOn(AnalyticsEvent, "trackUiEvent").mockResolvedValueOnce()

        await trackAnalyticsEventController(
            { body: { event: "comparisonOpened", comparisonType: "baseline" } } as any,
            response)

        expect(trackSpy).toHaveBeenCalledWith("comparisonOpened", { comparisonType: "baseline" })
    })

    it("returns no content when the analytics provider fails", async () => {
        jest.spyOn(AnalyticsEvent, "trackUiEvent").mockRejectedValueOnce(new Error("provider unavailable"))

        await trackAnalyticsEventController(
            { body: { event: "reportViewed" } } as any,
            response)

        expect(response.status).toHaveBeenCalledWith(StatusCode.NoContent)
    })
})
