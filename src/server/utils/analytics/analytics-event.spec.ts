import { AnalyticsEvent } from "./anyltics-event"
import { analytics } from "../analytics"

jest.mock("../analytics")

describe("AnalyticEvents", () => {
    const originalOptOutAnalytics = process.env.OPT_OUT_ANALYTICS

    beforeEach(() => {
        jest.clearAllMocks()
        delete process.env.OPT_OUT_ANALYTICS
    })

    afterAll(() => {
        if (originalOptOutAnalytics === undefined) {
            delete process.env.OPT_OUT_ANALYTICS
            return
        }
        process.env.OPT_OUT_ANALYTICS = originalOptOutAnalytics
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
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportProcessingFinished()
            expect(trackMock).toHaveBeenCalled()
        })
    })

    describe("trackUiEvent", () => {
        it("tracks a supported UI event with the server instance id", async () => {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("server-instance")

            await AnalyticsEvent.trackUiEvent("comparisonOpened", { comparisonType: "baseline" })

            expect(analytics.track).toHaveBeenCalledWith("comparisonOpened", {
                distinct_id: "server-instance",
                comparisonType: "baseline",
            })
        })

        it("does not track when analytics is disabled", async () => {
            process.env.OPT_OUT_ANALYTICS = "true"

            await AnalyticsEvent.trackUiEvent("reportViewed")

            expect(analytics.track).not.toHaveBeenCalled()
        })

        it("swallows analytics failures", async () => {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("server-instance")
            ;(analytics.track as jest.Mock).mockImplementationOnce(() => {
                throw new Error("analytics unavailable")
            })

            await expect(AnalyticsEvent.trackUiEvent("reportViewed")).resolves.toBeUndefined()
        })
    })

    describe("reportLabelCount", () => {
        it("should not track the event when analytics disabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportDetails(1, 1)
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportDetails(1, 1)
            expect(trackMock).toHaveBeenCalled()
        })
    })

    describe("reportProcessingStarted", () => {
        it("should not track the event when analytics disabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportProcessingStarted()
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportProcessingStarted()
            expect(trackMock).toHaveBeenCalled()
        })
    })
    describe("unexpectedError", () => {
        it("should not track the event when analytics disabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "true"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportUnexpectedError(Error("test"))
            expect(trackMock).not.toHaveBeenCalled()

        })
        it("should track the event only when analytics enabled", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportUnexpectedError(Error("test"))
            expect(trackMock).toHaveBeenCalled()
        })
        it("should ignore specific error numbers", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportUnexpectedError({ errno: -3008 })
            expect(trackMock).not.toHaveBeenCalled()
        })
        it("should log non-ignored error numbers", async function () {
            process.env.OPT_OUT_ANALYTICS = "false"
            jest.spyOn(AnalyticsEvent as any, "getInstanceId").mockResolvedValueOnce("mocked-id")
            const trackMock = (analytics.track as any).mockResolvedValueOnce(undefined)
            await AnalyticsEvent.reportUnexpectedError({ errno: -3010 })
            expect(trackMock).toHaveBeenCalled()
        })
    })
})
