import { db } from "../../../../db/db"
import {
    prepareChartDataForSaving,
    prepareDataForSavingToDb,
    prepareHistogramDataForSaving,
} from "../../../data-stats/prepare-data"
import { chartQueryOptionInterval } from "../../../data-stats/helper/duration"
import { sendDegradationNotifications, sendReportNotifications } from "../../../utils/notifications/send-notification"
import { AnalyticsEvent } from "../../../utils/analytics/anyltics-event"
import { scenarioThresholdsCalc } from "../utils/scenario-thresholds-calc"
import { itemDataProcessing } from "./item-data-processing"

jest.mock("../../../../db/db")
jest.mock("../../../data-stats/prepare-data")
jest.mock("../../../data-stats/helper/duration")
jest.mock("../../../utils/notifications/send-notification")
jest.mock("../../../utils/analytics/anyltics-event")
jest.mock("../utils/scenario-thresholds-calc")

const processedOverview = {
    duration: 1000,
    startDate: "2024-01-01T00:00:00.000Z",
}
const processedLabelStats = [{ label: "GET /health" }]
const CHART_MAX_VU = 12
const EXPECTED_TRANSACTION_QUERY_COUNT = 3
const processedChart = { threads: [[0, CHART_MAX_VU]] }

const setupSuccessfulProcessing = (scenarioSettings = {}) => {
    const transaction = { none: jest.fn().mockResolvedValue(undefined) }

    ;(db.one as jest.Mock)
        .mockResolvedValueOnce({ number_of_sut_hostnames: 1, number_of_hostnames: 1 })
        .mockResolvedValueOnce({
            apdexSettings: { enabled: false },
            deleteSamples: false,
            extraAggregations: false,
            thresholdEnabled: false,
            ...scenarioSettings,
        })
    ;(db.many as jest.Mock).mockResolvedValue([])
    ;(db.manyOrNone as jest.Mock).mockResolvedValue([])
    ;(db.none as jest.Mock).mockResolvedValue(undefined)
    ;(db.tx as jest.Mock).mockImplementation(callback => callback(transaction))
    ;(prepareDataForSavingToDb as jest.Mock).mockReturnValue({
        overview: { ...processedOverview },
        labelStats: processedLabelStats,
        sutOverview: [],
        errors: [],
    })
    ;(prepareHistogramDataForSaving as jest.Mock).mockReturnValue([])
    ;(prepareChartDataForSaving as jest.Mock).mockReturnValue(processedChart)
    ;(chartQueryOptionInterval as jest.Mock).mockReturnValue(processedOverview.duration)

    return transaction
}

describe("itemDataProcessing", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("saves processed report data, notifies subscribers, and marks the item ready", async () => {
        const transaction = setupSuccessfulProcessing()
        const saveItemStatsSpy = jest.spyOn(require("../../../queries/items"), "saveItemStats")
        const savePlotDataSpy = jest.spyOn(require("../../../queries/items"), "savePlotData")
        const updateItemSpy = jest.spyOn(require("../../../queries/items"), "updateItem")

        await itemDataProcessing({ itemId: "item-id", projectName: "project", scenarioName: "scenario" })

        expect(sendReportNotifications).toHaveBeenCalledWith(
            "project", "scenario", "item-id", { ...processedOverview, maxVu: CHART_MAX_VU })
        expect(prepareChartDataForSaving).toHaveBeenCalledTimes(1)
        expect(transaction.none).toHaveBeenCalledTimes(EXPECTED_TRANSACTION_QUERY_COUNT)
        expect(saveItemStatsSpy).toHaveBeenCalledWith(
            "item-id", JSON.stringify(processedLabelStats),
            { ...processedOverview, maxVu: CHART_MAX_VU }, "[]", "[]")
        expect(savePlotDataSpy).toHaveBeenCalledWith(
            "item-id", JSON.stringify(processedChart), "[]", "[]", "[]")
        expect(updateItemSpy).toHaveBeenCalledWith("item-id", "ready", processedOverview.startDate)
        expect(AnalyticsEvent.reportProcessingFinished).toHaveBeenCalledTimes(1)
        expect(AnalyticsEvent.reportDetails).toHaveBeenCalledWith(1, processedOverview.duration)
        expect(db.none).not.toHaveBeenCalled()
    })

    it("persists apdex and threshold results, sends degradation notifications, and purges samples", async () => {
        setupSuccessfulProcessing({
            apdexSettings: { enabled: true, satisfyingThreshold: 100, toleratingThreshold: 500 },
            deleteSamples: true,
            thresholdEnabled: true,
        })
        ;(db.oneOrNone as jest.Mock).mockResolvedValue({ stats: [{ label: "GET /health" }] })
        ;(scenarioThresholdsCalc as jest.Mock).mockReturnValue({ passed: false })
        const updateApdexSettingsSpy = jest.spyOn(require("../../../queries/items"), "updateItemApdexSettings")
        const saveThresholdsResultSpy = jest.spyOn(require("../../../queries/items"), "saveThresholdsResult")
        const deleteSamplesSpy = jest.spyOn(require("../../../queries/items"), "deleteSamples")

        await itemDataProcessing({ itemId: "item-id", projectName: "project", scenarioName: "scenario" })

        expect(updateApdexSettingsSpy).toHaveBeenCalledWith("item-id", {
            satisfyingThreshold: 100,
            toleratingThreshold: 500,
        })
        expect(saveThresholdsResultSpy).toHaveBeenCalledWith(
            "project", "scenario", "item-id", { passed: false })
        expect(sendDegradationNotifications).toHaveBeenCalledWith("project", "scenario", "item-id")
        expect(deleteSamplesSpy).toHaveBeenCalledWith("item-id")
        expect(db.none).toHaveBeenCalledTimes(EXPECTED_TRANSACTION_QUERY_COUNT)
    })
})
