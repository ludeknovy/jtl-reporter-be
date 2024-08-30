import { AnalyticsEvent } from "./anyltics-event"
import { analytics } from "../analytics"

jest.mock("../analytics")


describe("AnalyticEvents", () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })


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
        it("should track the event only when analytics enabled", function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportProcessingFinished()
            expect(trackMock).toHaveBeenCalled()
        })
    })

    describe("reportLabelCount", () => {
        it("should not track the event when analytics disabled", function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportDetails(1, 1)
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportDetails(1, 1)
            expect(trackMock).toHaveBeenCalled()
        })
    })

    describe("reportProcessingStarted", () => {
        it("should not track the event when analytics disabled", function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportProcessingStarted()
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportProcessingStarted()
            expect(trackMock).toHaveBeenCalled()
        })
    })
    describe("unexpectedError", () => {
        it("should not track the event when analytics disabled", function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportUnexpectedError(Error("test"))
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            AnalyticsEvent.reportUnexpectedError(Error("test"))
            expect(trackMock).toHaveBeenCalled()
        })
    })

})
