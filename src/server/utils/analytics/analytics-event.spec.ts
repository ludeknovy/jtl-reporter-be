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
        it("should not track the event when analytics disabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportProcessingFinished()
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id");
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportProcessingFinished()
            expect(trackMock).toHaveBeenCalled()
        })
    })

    describe("reportLabelCount", () => {
        it("should not track the event when analytics disabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id");
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportDetails(1, 1)
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id");
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportDetails(1, 1)
            expect(trackMock).toHaveBeenCalled()
        })
    })

    describe("reportProcessingStarted", () => {
        it("should not track the event when analytics disabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id");
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportProcessingStarted()
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id");
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportProcessingStarted()
            expect(trackMock).toHaveBeenCalled()
        })
    })
    describe("unexpectedError", () => {
        it("should not track the event when analytics disabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id");
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportUnexpectedError(Error("test"))
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id");
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportUnexpectedError(Error("test"))
            expect(trackMock).toHaveBeenCalled()
        })
    })

})
