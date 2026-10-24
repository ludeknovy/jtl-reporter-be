import { db } from "../../../../db/db"
import {
    prepareChartDataForSaving,
    prepareDataForSavingToDb,
    prepareHistogramDataForSaving,
} from "../../../data-stats/prepare-data"
import { AnalyticsEvent } from "../../../utils/analytics/anyltics-event"
import { sendDegradationNotifications, sendReportNotifications } from "../../../utils/notifications/send-notification"
import { scenarioThresholdsCalc } from "../utils/scenario-thresholds-calc"
import { itemDataProcessing } from "./item-data-processing"

jest.mock("../../../../db/db")
jest.mock("../../../data-stats/prepare-data", () => ({
    prepareChartDataForSaving: jest.fn(),
    prepareDataForSavingToDb: jest.fn(),
    prepareHistogramDataForSaving: jest.fn(),
}))
jest.mock("../../../utils/analytics/anyltics-event", () => ({
    AnalyticsEvent: {
        reportDetails: jest.fn(),
        reportProcessingFinished: jest.fn(),
    },
}))
jest.mock("../../../utils/notifications/send-notification", () => ({
    sendDegradationNotifications: jest.fn(),
    sendReportNotifications: jest.fn(),
}))
jest.mock("../utils/scenario-thresholds-calc")

const ITEM_ID = "item-id"
const DEFAULT_INTERVAL = "300 milliseconds"
const QUERIES_PER_INTERVAL = 5
const EXTRA_AGGREGATION_INTERVALS = 9
const CHART_MAX_VU = 12
const PROCESSED_OVERVIEW = { duration: 1000, startDate: "2024-01-01T00:00:00.000Z" }
const PROCESSED_LABEL_STATS = [{ label: "GET /health" }]
const PROCESSED_CHART = { threads: [[0, CHART_MAX_VU]] }
const TRANSACTION_QUERY_COUNT = 3

interface Deferred<T> {
    promise: Promise<T>
    resolve: (value: T) => void
}

const createDeferred = <T>() => {
    let resolve: (value: T) => void
    const promise = new Promise<T>(res => {
        resolve = res
    })

    return { promise, resolve }
}

describe("itemDataProcessing", () => {
    let chartIntervals: string[]
    let activeChartQueries: number
    let maxActiveChartQueries: number
    let firstInterval: Deferred<unknown[]>

    const isChartQuery = (query) => query.values?.[0] !== ITEM_ID && typeof query.values?.[0] === "string"

    const configureDatabase = (extraAggregations: boolean, waitForFirstInterval = false) => {
        chartIntervals = []
        activeChartQueries = 0
        maxActiveChartQueries = 0
        firstInterval = createDeferred<unknown[]>()

        const runQuery = (query) => {
            if (!isChartQuery(query)) {
                return Promise.resolve([])
            }

            const interval = query.values[0]
            chartIntervals.push(interval)
            activeChartQueries++
            maxActiveChartQueries = Math.max(maxActiveChartQueries, activeChartQueries)

            const queryResult = waitForFirstInterval && interval === DEFAULT_INTERVAL
                ? firstInterval.promise
                : Promise.resolve([])

            return queryResult.then(result => {
                activeChartQueries--
                return result
            })
        }

        ;(db.one as any)
            .mockResolvedValueOnce({
                apdexSettings: { enabled: false },
                deleteSamples: false,
                extraAggregations,
                thresholdEnabled: false,
            })
            .mockResolvedValueOnce({
                number_of_hostnames: 2,
                number_of_sut_hostnames: 0,
            })
        ;(db.many as any).mockImplementation(runQuery)
        ;(db.manyOrNone as any).mockImplementation(runQuery)
        ;(db.tx as any).mockImplementation(callback => callback({ none: jest.fn().mockResolvedValue(undefined) }))
    }

    const configureSuccessfulProcessing = (scenarioSettings = {}) => {
        const transaction = { none: jest.fn().mockResolvedValue(undefined) }
        ;(db.one as any)
            .mockResolvedValueOnce({
                apdexSettings: { enabled: false },
                deleteSamples: false,
                extraAggregations: false,
                thresholdEnabled: false,
                ...scenarioSettings,
            })
            .mockResolvedValueOnce({ number_of_hostnames: 1, number_of_sut_hostnames: 1 })
        ;(db.many as any).mockResolvedValue([])
        ;(db.manyOrNone as any).mockResolvedValue([])
        ;(db.none as any).mockResolvedValue(undefined)
        ;(db.tx as any).mockImplementation(callback => callback(transaction))
        ;(prepareDataForSavingToDb as any).mockReturnValue({
            errors: [],
            labelStats: PROCESSED_LABEL_STATS,
            overview: { ...PROCESSED_OVERVIEW },
            sutOverview: [],
        })
        ;(prepareHistogramDataForSaving as any).mockReturnValue([])
        ;(prepareChartDataForSaving as any).mockReturnValue(PROCESSED_CHART)

        return transaction
    }

    beforeEach(() => {
        jest.resetAllMocks()
        ;(prepareDataForSavingToDb as any).mockReturnValue({
            errors: {},
            labelStats: [],
            overview: { duration: 1, startDate: new Date() },
            sutOverview: [],
        })
        ;(prepareHistogramDataForSaving as any).mockReturnValue({})
        ;(prepareChartDataForSaving as any).mockReturnValue({ threads: [[0, 1]] })
    })

    it("runs at most one interval's chart queries at a time", async () => {
        configureDatabase(true, true)

        const processing = itemDataProcessing({ itemId: ITEM_ID, projectName: "project", scenarioName: "scenario" })
        await new Promise(resolve => setImmediate(resolve))

        expect(chartIntervals).toEqual(Array(QUERIES_PER_INTERVAL).fill(DEFAULT_INTERVAL))
        expect(maxActiveChartQueries).toBe(QUERIES_PER_INTERVAL)

        firstInterval.resolve([])
        await processing

        expect(new Set(chartIntervals).size).toBe(EXTRA_AGGREGATION_INTERVALS)
    })

    it("loads only the default interval when extra aggregations are disabled", async () => {
        configureDatabase(false)

        await itemDataProcessing({ itemId: ITEM_ID, projectName: "project", scenarioName: "scenario" })

        expect(chartIntervals).toEqual(Array(QUERIES_PER_INTERVAL).fill(DEFAULT_INTERVAL))
    })

    it("saves processed report data, notifies subscribers, and marks the item ready", async () => {
        const transaction = configureSuccessfulProcessing()
        const saveItemStatsSpy = jest.spyOn(require("../../../queries/items"), "saveItemStats")
        const savePlotDataSpy = jest.spyOn(require("../../../queries/items"), "savePlotData")
        const updateItemSpy = jest.spyOn(require("../../../queries/items"), "updateItem")

        await itemDataProcessing({ itemId: ITEM_ID, projectName: "project", scenarioName: "scenario" })

        expect(sendReportNotifications).toHaveBeenCalledWith(
            "project", "scenario", ITEM_ID, { ...PROCESSED_OVERVIEW, maxVu: CHART_MAX_VU })
        expect(transaction.none).toHaveBeenCalledTimes(TRANSACTION_QUERY_COUNT)
        expect(saveItemStatsSpy).toHaveBeenCalledWith(
            ITEM_ID, JSON.stringify(PROCESSED_LABEL_STATS),
            { ...PROCESSED_OVERVIEW, maxVu: CHART_MAX_VU }, "[]", "[]")
        expect(savePlotDataSpy).toHaveBeenCalledWith(
            ITEM_ID, JSON.stringify(PROCESSED_CHART), "[]", "[]", "[]")
        expect(updateItemSpy).toHaveBeenCalledWith(ITEM_ID, "ready", PROCESSED_OVERVIEW.startDate)
        expect(AnalyticsEvent.reportProcessingFinished).toHaveBeenCalledTimes(1)
        expect(AnalyticsEvent.reportDetails).toHaveBeenCalledWith(1, PROCESSED_OVERVIEW.duration)
        expect(db.none).not.toHaveBeenCalled()
    })

    it("persists apdex and threshold results, sends degradation notifications, and purges samples", async () => {
        configureSuccessfulProcessing({
            apdexSettings: { enabled: true, satisfyingThreshold: 100, toleratingThreshold: 500 },
            deleteSamples: true,
            thresholdEnabled: true,
        })
        ;(db.oneOrNone as any).mockResolvedValue({ stats: [{ label: "GET /health" }] })
        ;(scenarioThresholdsCalc as any).mockReturnValue({ passed: false })
        const updateApdexSettingsSpy = jest.spyOn(require("../../../queries/items"), "updateItemApdexSettings")
        const saveThresholdsResultSpy = jest.spyOn(require("../../../queries/items"), "saveThresholdsResult")
        const deleteSamplesSpy = jest.spyOn(require("../../../queries/items"), "deleteSamples")

        await itemDataProcessing({ itemId: ITEM_ID, projectName: "project", scenarioName: "scenario" })

        expect(updateApdexSettingsSpy).toHaveBeenCalledWith(ITEM_ID, {
            satisfyingThreshold: 100,
            toleratingThreshold: 500,
        })
        expect(saveThresholdsResultSpy).toHaveBeenCalledWith(
            "project", "scenario", ITEM_ID, { passed: false })
        expect(sendDegradationNotifications).toHaveBeenCalledWith("project", "scenario", ITEM_ID)
        expect(deleteSamplesSpy).toHaveBeenCalledWith(ITEM_ID)
        expect(db.none).toHaveBeenCalledTimes(TRANSACTION_QUERY_COUNT)
    })
})
