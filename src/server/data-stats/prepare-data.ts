/* eslint-disable @typescript-eslint/no-magic-numbers,max-lines */
import { roundNumberTwoDecimals } from "./helper/stats-fc"
import * as moment from "moment"
import { logger } from "../../logger"
import { shouldSkipLabel } from "../controllers/item/utils/labelFilter"

export const prepareDataForSavingToDb = (overviewData, labelData, sutStats, statusCodeDistr: StatusCodeDistribution[],
                                         responseFailures: ResponseMessageFailures[], apdex: Apdex[],
                                         groupedErrors: GroupedErrors[], top5Errors: Top5ErrorsRaw[]):
    // eslint-disable-next-line max-len
    {
        overview: Overview
        labelStats: LabelStats[]
        sutOverview: Array<Record<string, unknown>>
        errors: ErrorSummary
    } => {
    try {
        const startDate = new Date(overviewData.start)
        const endDate = new Date(overviewData.end)
        return {
            overview: {
                percentil: roundNumberTwoDecimals(overviewData.n90),
                maxVu: undefined,
                avgResponseTime: Math.round(overviewData.avg_response),
                errorRate: roundNumberTwoDecimals((overviewData.number_of_failed / overviewData.total) * 100),
                errorCount: overviewData.number_of_failed,
                throughput: roundNumberTwoDecimals(
                    overviewData.total / ((overviewData.end - overviewData.start) / 1000)),
                bytesPerSecond: roundNumberTwoDecimals(
                    overviewData.bytes_sent_total / ((overviewData.end - overviewData.start) / 1000)),
                bytesSentPerSecond: roundNumberTwoDecimals(
                    overviewData.bytes_received_total / ((overviewData.end - overviewData.start) / 1000)),
                avgLatency: roundNumberTwoDecimals(overviewData.avg_latency),
                avgConnect: roundNumberTwoDecimals(overviewData.avg_connect),
                startDate,
                endDate,
                duration: roundNumberTwoDecimals((endDate.getTime() - startDate.getTime()) / 1000 / 60),
            },
            labelStats: labelData.map((_) => {
                const apdexData = apdex?.find(ap => ap.label === _.label)

                return {
                    label: _.label,
                    samples: _.total_samples,
                    avgResponseTime: Math.round(_.avg_response),
                    medianResponseTime: _.n50,
                    latency: roundNumberTwoDecimals(_.latency),
                    connect: roundNumberTwoDecimals(_.connect),
                    standardDeviation: _.standard_deviation,
                    minResponseTime: _.min_response,
                    maxResponseTime: _.max_response,
                    errorRate: roundNumberTwoDecimals(_.number_of_failed / _.total_samples * 100),
                    bytesPerSecond: roundNumberTwoDecimals(_.bytes_received_total / ((_.end - _.start) / 1000)),
                    bytesSentPerSecond: roundNumberTwoDecimals(_.bytes_sent_total / ((_.end - _.start) / 1000)),
                    throughput: roundNumberTwoDecimals(
                        _.total_samples / ((_.end - _.start) / 1000)),
                    n9: _.n99,
                    n5: _.n95,
                    n0: _.n90,
                    statusCodes: statusCodeDistr
                        .filter((sd) => sd.label === _.label)
                        .map((sd) => ({ statusCode: sd.status_code, count: sd.count })),
                    responseMessageFailures: responseFailures
                        .filter((rm) => rm.label === _.label)
                        .map((rm) => ({
                            responseMessage: rm.response_message,
                            count: rm.count, statusCode: rm.status_code,
                            failureMessage: rm.failure_message,
                        })),
                    apdex: {
                        toleration: apdexData?.toleration ? Number(apdexData.toleration) : null,
                        satisfaction: apdexData?.satisfaction ? Number(apdexData.satisfaction) : null,
                    },
                }
            }),
            sutOverview: sutStats.map((_) => ({
                sutHostname: _.sut_hostname,
                percentile: roundNumberTwoDecimals(_.n90),
                avgResponseTime: Math.round(_.avg_response),
                errorRate: roundNumberTwoDecimals((_.number_of_failed / _.total) * 100),
                throughput: roundNumberTwoDecimals(_.total / ((_.end - _.start) / 1000)),
                bytesPerSecond: roundNumberTwoDecimals(_.bytes_received_total / ((_.end - _.start) / 1000)),
                bytesSentPerSecond: roundNumberTwoDecimals(_.bytes_sent_total / ((_.end - _.start) / 1000)),
                avgLatency: roundNumberTwoDecimals(_.avg_latency),
                avgConnect: roundNumberTwoDecimals(_.avg_connect),
            })),
            errors: processErrors(groupedErrors, top5Errors),
        }
    } catch(error) {
        throw new Error(`Error while processing query results ${error}`)
    }
}

export const prepareHistogramDataForSaving = (responseTimePerLabelDistribution: ResponseTimeHistogram[]) => {
    // removing first and last numbers, see https://docs.timescale.com/api/latest/hyperfunctions/histogram/
    return {
        responseTimePerLabelDistribution: responseTimePerLabelDistribution.map(data => ({
            label: data.label,
            values: data.histogram.slice(1, data.histogram.length - 1),
        })),
    }
}


export const prepareChartDataForSaving = (
    {
        overviewData,
        labelData,
        interval,
        distributedThreads,
        statusCodeData,
    }: PrepareChartsData) => {
    const intervalSec = interval / 1000
    const labels = [...new Set(labelData.map((_) => _.label))]
    const statusCodes = [...new Set(statusCodeData.map(row => row.statusCode))]
    return {
        threads: distributedThreads?.length > 0
            ? calculateDistributedThreads(distributedThreads)
            : overviewData.map((_) => [moment(_.time).valueOf(), _.threads]) as Array<[number, number]>,
        overAllFailRate: {
            data: overviewData.map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.error_rate * 100)]),
            name: "errors",
        },
        overallTimeResponse: {
            data: overviewData.map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.avg_response)]),
            name: "response time",
        },
        overallThroughput: {
            data: overviewData.map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.total / intervalSec)]),
            name: "throughput",
        },
        overAllNetworkUp: {
            data: overviewData.map((_) => [moment(_.time).valueOf(),
                roundNumberTwoDecimals(Number(_.bytes_sent_total) / intervalSec)]),
            name: "network up",
        },
        overAllNetworkDown: {
            data: overviewData.map((_) => [moment(_.time).valueOf(),
                roundNumberTwoDecimals(Number(_.bytes_received_total) / intervalSec)]),
            name: "network down",
        },
        overAllNetworkV2: {
            data: overviewData.map((_) => [moment(_.time).valueOf(),
                roundNumberTwoDecimals((Number(_.bytes_received_total) + (Number(_.bytes_sent_total))) / intervalSec)]),
            name: "network",
        },
        statusCodes: statusCodes.map((statusCode) => ({
            data: statusCodeData.filter(row => row.statusCode === statusCode)
                .map(row => [moment(row.time).valueOf(), row.count]),
            name: statusCode,
        })),
        throughput: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.total / intervalSec)]),
            name: label,
        })),
        responseTime: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.avg_response)]),
            name: label,
        })),
        minResponseTime: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.min_response)]),
            name: label,
        })),
        maxResponseTime: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.max_response)]),
            name: label,
        })),
        networkV2: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(),
                    roundNumberTwoDecimals((Number(_.bytes_received_total)
                        + Number(_.bytes_sent_total)) / intervalSec)]),
            name: label,
        })),
        networkUp: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(),
                    roundNumberTwoDecimals(Number(_.bytes_sent_total) / intervalSec)]),
            name: label,
        })),
        networkDown: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(),
                    roundNumberTwoDecimals(Number(_.bytes_received_total) / intervalSec)]),
            name: label,
        })),
        percentile50: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.n50)]),
            name: label,
        })),
        percentile90: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.n90)]),
            name: label,
        })),
        percentile95: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.n95)]),
            name: label,
        })),
        percentile99: labels.map((label) => ({
            data: labelData.filter((_) => _.label === label)
                .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.n99)]),
            name: label,
        })),
        errorRate: labels.map((label) => ({
            data: labelData.filter((data) => data.label === label)
                .map((data) => [moment(data.time).valueOf(), roundNumberTwoDecimals(data.error_rate * 100)]),
            name: label,
        })),
    }
}

export const calculateDistributedThreads = (distributedThreads: DistributedThreadData[]): Array<[number, number]> => {
    const threadAcc = distributedThreads.reduce((acc, curr) => {
        const interval = moment(curr.time).valueOf()
        if (!acc[interval]) {
            acc[interval] = 0
        }
        acc[interval] += curr.threads
        return acc
    }, {})

    const threads = []

    for (const key in threadAcc) {
        threads.push([parseInt(key, 10), threadAcc[key]])
    }
    return threads
}

export const stringToNumber = (input: string, radix: number) => {
    const result = parseInt(input, radix)
    if (isNaN(result)) {
        // eslint-disable-next-line no-throw-literal
        throw ("not a number")
    }
    return result
}

export const transformDataForDb = (_, itemId, labelFilterSettings) => {
    if (shouldSkipLabel(_.label, labelFilterSettings)) {
        return
    }
    try {
        _.timeStamp = new Date(stringToNumber(_.timeStamp, 10))
        _.elapsed = stringToNumber(_.elapsed, 10)
        _.bytes = stringToNumber(_.bytes, 10)
        _.sentBytes = _.sentBytes ? stringToNumber(_.sentBytes, 10) : 0
        _.grpThreads = stringToNumber(_.grpThreads, 10)
        _.allThreads = stringToNumber(_.allThreads, 10)
        _.Latency = stringToNumber(_.Latency, 10)
        _.Connect = stringToNumber(_.Connect, 10)
        _.success = _.success === "true"
        _.sutHostname = getHostnameFromUrl(_.URL)
        _.itemId = itemId
        return _
    } catch(error) {
        logger.error(`Error while parsing data: ${error}`)
    }
}

export const transformMonitoringDataForDb = (row, itemId): MonitoringTransformedData => {
    try {
        return {
            timestamp: new Date(stringToNumber(row.ts, 10) * 1000),
            cpu: stringToNumber(row.cpu, 10),
            mem: stringToNumber(row.mem || 0, 10),
            name: row.name || "localhost",
            itemId,
        }
    } catch(error) {
        logger.error(`Error while parsing monitoring data: ${error}`)

    }

}

export const getHostnameFromUrl = (url) => {
    if (!url) {
        return
    }
    try {
        const hostname = new URL(url).hostname
        if (hostname && hostname.length > 0) {
            return hostname
        }
    } catch(error) {

    }
}

const processErrors = (groupedErrors: GroupedErrors[], top5Errors: Top5ErrorsRaw[]): ErrorSummary => {
    return {
        groupedErrors: groupedErrors.map(err => ({ ...err, count: Number(err.count) })),
        topErrorsByLabel: formatGroupedLabelErrors(groupErrorsByLabel(top5Errors)),
    }
}

// eslint-disable-next-line max-len
const formatGroupedLabelErrors = (groupedLabelErrors: Record<string, LabelError[]>): Top5Errors[] => {
    const formattedLabelErrors: Top5Errors[] = []
    console.log(groupedLabelErrors)
    for (const [key, value] of Object.entries(groupedLabelErrors)) {
        const errors = value.map((errElement )=> {
            return errElement
        })
        const [error1, error2, error3, error4, error5] = errors
        formattedLabelErrors.push({
            label: key,
            error1,
            error2,
            error3,
            error4,
            error5,
        })
    }


    return formattedLabelErrors
}

const groupErrorsByLabel = (top5Errors: Top5ErrorsRaw[]): Record<string, Array<{ count: number; error: string }>> => {
    return top5Errors.reduce((acc, curr) => {
        const label = curr.label
        if (label && !acc[label]) {
            acc[label] = []
        }
        const error = getError(curr)
        acc[label].push({ error, count: curr.cnt })
        return acc
    }, {})
}

const getError = (line: Top5ErrorsRaw) => {
    if (!line.failure_message || line.failure_message.length === 0) {
        return `${line.status_code}/${line.response_message}`
    }
    return line.failure_message

}

export interface ItemDbData {
    itemStats: any
    overview: any
    startTime: Date
    sortedData: any
}

export interface InputData {
    timeStamp: string
    elapsed: string
    label: string
    responseCode: string
    responseMessage: string
    threadName: string
    success: string
    bytes: string
    grpThreads: string
    allThreads: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Latency: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Hostname: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Connect: string
}

export interface OutputData {
    timeStamp: number
    elapsed: number
    label: string
    responseCode: number
    responseMessage: string
    threadName: string
    success: boolean
    bytes: number
    grpThreads: number
    allThreads: number
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Latency: number
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Hostname: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Connect: number
}

interface ChartOverviewData {
    min: Date
    max: Date
    total: number
    threads: number
    avg_response: number
    time: Date
    number_of_failed: number
    bytes_received_total: number
    bytes_sent_total: number
    error_rate: number
}

interface ChartLabelData {
    time: Date
    label: string
    min: Date
    max: Date
    total: number
    threads: number
    avg_response: number
    min_response: number
    max_response: number
    bytes_received_total: number
    bytes_sent_total: number
    n50: number
    n90: number
    n95: number
    n99: number
    error_rate: number
}

export interface Overview {
    percentil: number
    errorRate: number
    errorCount: number
    throughput: number
    duration: number
    maxVu: number
    avgResponseTime: number
    avgLatency: number
    avgConnect: number
    startDate: Date
    endDate: Date
    bytesPerSecond: number
    bytesSentPerSecond: number
}

interface DistributedThreadData {
    time: Date
    hostname: string
    threads: number
}

interface MonitoringTransformedData {
    timestamp: Date
    cpu: number
    mem: number
    name: string
    itemId: string
}

interface StatusCodeDistribution {
    label: string
    status_code: string
    count: number
}

interface ResponseMessageFailures {
    label: string
    response_message: string
    status_code: string
    count: number
    failure_message: string
}

interface Apdex {
    label: string
    satisfaction: string
    toleration: string
}

interface StatuCodesData {
    time: string
    statusCode: string
    count: number

}

interface PrepareChartsData {
    distributedThreads?: []
    interval: number
    labelData: ChartLabelData[]
    overviewData: ChartOverviewData[]
    statusCodeData: StatuCodesData[]
}

interface ResponseTimeHistogram {
    histogram: number[]
    label: string
}

export interface LabelStats {
    label: string
    samples: number
    avgResponseTime: number
    medianResponseTime: number
    latency: number
    connect: number
    standardDeviation: number
    minResponseTime: number
    maxResponseTime: number
    errorRate: number
    bytesPerSecond: number
    bytesSentPerSecond: number
    throughput: number
    n9: number
    n5: number
    n0: number
    statusCodes: [{ statusCode: string; count: number }]
    responseMessageFailures: [{
        responseMessage: string
        count: number
        statusCode: string
        failureMessage: string
    }]
    apdex: {
        toleration?: number
        satisfaction?: number
    }
}

interface GroupedErrors {
    statusCode: string
    responseMessage: string
    failureMessage: string
    count: string
}

interface ErrorSummary {
    groupedErrors: Errors[]
    topErrorsByLabel: Top5Errors[]
}

interface Errors {
    count: number
    statusCode: string
    responseMessage: string
    failureMessage: string
}

interface Top5ErrorsRaw {
    label: string
    status_code: string
    response_message: string
    failure_message: string
    cnt: string
    row_n: string
}

interface Top5Errors {
    label: string
    error1: LabelError
    error2: LabelError
    error3: LabelError
    error4: LabelError
    error5: LabelError
}

interface LabelError { count: number; error: string }
