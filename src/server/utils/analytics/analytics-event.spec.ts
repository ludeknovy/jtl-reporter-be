import { AnalyticsEvent } from "./anyltics-event"
import { analytics } from "../analytics"

jest.mock("../analytics")


describe("AnalyticEvents", () => {
    describe("isAnalyticEnabled", () => {
        it("should return true when OPT_OUT_ANALYTICS not set", function () {
            const isEnabled = AnalyticsEvent.isAnalyticEnabled()
            expect(isEnabled).toEqual(true)
        })

        it("should return true when OPT_OUT_ANALYTICS not disabled", function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            const isEnabled = AnalyticsEvent.isAnalyticEnabled()
            expect(isEnabled).toEqual(true)
        })
        it("should return false when OPT_OUT_ANALYTICS disabled", function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            const isEnabled = AnalyticsEvent.isAnalyticEnabled()
            expect(isEnabled).toEqual(false)
        })
    })
    describe("reportProcessingFinished", () => {
        it("should not track the event when analytics disabled", function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportProcessingFinished()
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the even only when analytics enabled", function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportProcessingFinished()
            expect(trackMock).toHaveBeenCalled()
        })
    })

})
