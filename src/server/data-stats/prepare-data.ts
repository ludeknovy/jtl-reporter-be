/* eslint-disable @typescript-eslint/no-magic-numbers */
import { roundNumberTwoDecimals } from "./helper/stats-fc"
import * as moment from "moment"
import { logger } from "../../logger"

// eslint-disable-next-line max-len
export const prepareDataForSavingToDb = (overviewData, labelData, sutStats, statusCodeDistr: StatusCodeDistribution[], responseFailures: ResponseMessageFailures[]):
    { overview: Overview; labelStats; sutOverview: Array<Record<string, unknown>> } => {
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
        throughput: roundNumberTwoDecimals(overviewData.total / ((overviewData.end - overviewData.start) / 1000)),
        bytesPerSecond:
          roundNumberTwoDecimals(overviewData.bytes_sent_total / ((overviewData.end - overviewData.start) / 1000)),
        // eslint-disable-next-line max-len
        bytesSentPerSecond: roundNumberTwoDecimals(overviewData.bytes_received_total / ((overviewData.end - overviewData.start) / 1000)),
        avgLatency: roundNumberTwoDecimals(overviewData.avg_latency),
        avgConnect: roundNumberTwoDecimals(overviewData.avg_connect),
        startDate,
        endDate,
        duration: roundNumberTwoDecimals((endDate.getTime() - startDate.getTime()) / 1000 / 60),
      },
      labelStats: labelData.map((_) => ({
        label: _.label,
        samples: _.total_samples,
        avgResponseTime: Math.round(_.avg_response),
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
          .map((rm) => ({ responseMessage: rm.response_message, count: rm.count, statusCode: rm.status_code })),
      })),
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
    }
  } catch(error) {
    throw new Error(`Error while processing query results ${error}`)
  }
}

export const prepareChartDataForSaving = (
  overviewData: ChartOverviewData[], labelData: ChartLabelData[], interval: number, distributedThreads?: []) => {
  const intervalSec = interval / 1000
  const labels = [...new Set(labelData.map((_) => _.label))]
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
        roundNumberTwoDecimals(_.bytes_sent_total / intervalSec)]),
      name: "network up",
    },
    overAllNetworkDown: {
      data: overviewData.map((_) => [moment(_.time).valueOf(),
        roundNumberTwoDecimals(_.bytes_received_total / intervalSec)]),
      name: "network down",
    },
    overAllNetworkV2: {
      data: overviewData.map((_) => [moment(_.time).valueOf(),
        roundNumberTwoDecimals((_.bytes_received_total + _.bytes_sent_total) / intervalSec)]),
      name: "network",
    },
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
          roundNumberTwoDecimals((_.bytes_received_total + _.bytes_sent_total) / intervalSec)]),
      name: label,
    })),
    networkUp: labels.map((label) => ({
      data: labelData.filter((_) => _.label === label)
        .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.bytes_sent_total / intervalSec)]),
      name: label,
    })),
    networkDown: labels.map((label) => ({
      data: labelData.filter((_) => _.label === label)
        .map((_) => [moment(_.time).valueOf(), roundNumberTwoDecimals(_.bytes_received_total / intervalSec)]),
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

export const transformDataForDb = (_, itemId) => {
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
  n90: number
  n95: number
  n99: number
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
}
