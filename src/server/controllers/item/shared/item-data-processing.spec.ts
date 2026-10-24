import { db } from "../../../../db/db"
import {
    prepareChartDataForSaving,
    prepareDataForSavingToDb,
    prepareHistogramDataForSaving,
} from "../../../data-stats/prepare-data"
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

const ITEM_ID = "item-id"
const DEFAULT_INTERVAL = "300 milliseconds"
const QUERIES_PER_INTERVAL = 5
const EXTRA_AGGREGATION_INTERVALS = 9

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
})
