/* eslint-disable @typescript-eslint/no-magic-numbers, max-lines */


import {
    calculateDistributedThreads, GroupedErrors,
    prepareChartDataForSaving,
    prepareDataForSavingToDb, prepareHistogramDataForSaving,
    stringToNumber, Top5ErrorsRaw, transformDataForDb, transformMonitoringDataForDb,
} from "./prepare-data"

describe("prepare data", () => {
    describe("transformDataForDb", () => {
        it("should return undefined when unable to process data", () => {
            const result = transformDataForDb({}, "itemId", [])
            expect(result).toBeUndefined()
        })
        it("should call shouldSkipLabel function", () => {
            const shouldSkipLabelSpy = jest.spyOn(require("../controllers/item/utils/labelFilter"), "shouldSkipLabel")
            const inputData = {
                bytes: "792",
                sentBytes: "124",
                label: "endpoint3",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Connect: "155",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Latency: "190",
                elapsed: "191",
                success: "true",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Hostname: "localhost",
                timeStamp: "1555399218911",
                allThreads: "1",
                grpThreads: "1",
                threadName: "Thread 1-1",
                responseCode: "200",
                responseMessage: "",
            }
            transformDataForDb(inputData, "itemId", [])
            expect(shouldSkipLabelSpy).toHaveBeenCalledWith(inputData.label, [])
        })
        it("should correctly proccess data", () => {
            const inputData = {
                bytes: "792",
                sentBytes: "124",
                label: "endpoint3",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Connect: "155",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Latency: "190",
                elapsed: "191",
                success: "true",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Hostname: "localhost",
                timeStamp: "1555399218911",
                allThreads: "1",
                grpThreads: "1",
                threadName: "Thread 1-1",
                responseCode: "200",
                responseMessage: "",
            }
            const result = transformDataForDb(inputData, "itemId", [])
            expect(result).toEqual({
                bytes: 792,
                sentBytes: 124,
                label: "endpoint3",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Connect: 155,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Latency: 190,
                elapsed: 191,
                success: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Hostname: "localhost",
                timeStamp: new Date(1555399218911),
                allThreads: 1,
                grpThreads: 1,
                itemId: "itemId",
                threadName: "Thread 1-1",
                responseCode: "200",
                responseMessage: "",
                sutHostname: undefined,
            })
        })
        it("should return sutHostname when URL provided with valid url", () => {
            const inputData = {
                bytes: "792",
                sentBytes: "123",
                label: "endpoint3",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Connect: "155",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Latency: "190",
                elapsed: "191",
                success: "true",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Hostname: "localhost",
                timeStamp: "1555399218911",
                allThreads: "1",
                grpThreads: "1",
                threadName: "Thread 1-1",
                responseCode: "200",
                responseMessage: "",
                URL: "https://example.com/styles.css",
            }
            const result = transformDataForDb(inputData, "itemId", [])
            expect(result.sutHostname).toEqual("example.com")
        })
        it("should return sutHostname undefined when URL contains empty url", () => {
            const inputData = {
                bytes: "792",
                sentBytes: "123",
                label: "endpoint3",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Connect: "155",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Latency: "190",
                elapsed: "191",
                success: "true",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Hostname: "localhost",
                timeStamp: "1555399218911",
                allThreads: "1",
                grpThreads: "1",
                threadName: "Thread 1-1",
                responseCode: "200",
                responseMessage: "",
                URL: "",
            }
            const result = transformDataForDb(inputData, "itemId", [])
            expect(result.sutHostname).toBeUndefined()
        })
        it("should return sutHostname undefined when URL contains invalid url", () => {
            const inputData = {
                bytes: "792",
                sentBytes: "123",
                label: "endpoint3",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Connect: "155",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Latency: "190",
                elapsed: "191",
                success: "true",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Hostname: "localhost",
                timeStamp: "1555399218911",
                allThreads: "1",
                grpThreads: "1",
                threadName: "Thread 1-1",
                responseCode: "200",
                responseMessage: "",
                URL: "file",
            }
            const result = transformDataForDb(inputData, "itemId", [])
            expect(result.sutHostname).toBeUndefined()
        })
        it("should process the data even when sentBytes not provided", () => {
            const inputData = {
                bytes: "792",
                label: "endpoint3",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Connect: "155",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Latency: "190",
                elapsed: "191",
                success: "true",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Hostname: "localhost",
                timeStamp: "1555399218911",
                allThreads: "1",
                grpThreads: "1",
                threadName: "Thread 1-1",
                responseCode: "200",
                responseMessage: "",
                URL: "file",
            }
            const result = transformDataForDb(inputData, "itemId", [])
            expect(result.sentBytes).toEqual(0)
        })
    })
    describe("stringToNumber", () => {
        it("should convert string to number", () => {
            const result = stringToNumber("1", 10)
            expect(result).toBe(1)
        })
        it("should throw an error when unable to convert ", () => {
            expect(() => {
                stringToNumber(undefined, 10)
            }).toThrow()
        })
    })
    describe("calculateDistributedThreads", () => {
        it("should correctly calculate distributed threads", () => {
            const inputData = [
                {
                    time: new Date(1555399218911),
                    hostname: "generator-1",
                    threads: 10,
                },
                {
                    time: new Date(1555399218911),
                    hostname: "generator-2",
                    threads: 10,
                },
                {
                    time: new Date(1555399218911),
                    hostname: "generator-3",
                    threads: 5,
                },
            ]
            const distributedThreads = calculateDistributedThreads(inputData)
            expect(distributedThreads).toEqual([[1555399218911, 25]])
        })
    })
    describe("prepareDataForSavingToDb", () => {
        it("should correctly parse data", () => {
            const overviewData = {
                _id: null,
                start: new Date("2021-03-29T10:57:10.882Z"),
                end: new Date("2021-03-29T11:27:10.171Z"),
                avg_connect: 5.802922997682204,
                avg_latency: 105.62091166623745,
                avg_response: 105.72559876384238,
                bytes_received_total: 123123,
                bytes_sent_total: 69848465,
                total: 46596,
                n90: 271,
                number_of_failed: 3,
            }
            const labelsData = [
                {
                    label: "label1",
                    min_response: 227,
                    max_response: 1325,
                    avg_response: 286.97317596566523,
                    bytes_received_total: 123,
                    bytes_sent_total: 1231,
                    total_samples: 932,
                    start: new Date("2021-03-29T10:59:01.561Z"),
                    end: new Date("2021-03-29T11:27:07.702Z"),
                    n90: 343,
                    n95: 367,
                    n99: 418,
                    latency: 1,
                    connect: 2,
                    number_of_failed: 0,
                },
                {
                    label: "label2",
                    min_response: 35,
                    max_response: 118,
                    avg_response: 44.93503480278422,
                    total_samples: 431,
                    bytes_received_total: 123,
                    bytes_sent_total: 1231,
                    start: new Date("2021-03-29T11:00:53.221Z"),
                    end: new Date("2021-03-29T11:27:01.650Z"),
                    n90: 50,
                    n95: 56,
                    n99: 93,
                    latency: 3,
                    connect: 4,
                    number_of_failed: 0,
                },
            ]
            const statusCodes = [
                { label: "label2", status_code: "200", count: 433 },
                { label: "label1", status_code: "200", count: 932 }]
            const responseFailures = [
                {
                    label: "label1",
                    response_message: "failure",
                    count: 31,
                    status_code: "100",
                    failure_message: "failure",
                },
                {
                    label: "label2",
                    response_message: "failure2",
                    count: 1,
                    status_code: "101",
                    failure_message: "failure1",
                },
            ]
            const apdex = [
                { label: "label1", toleration: "40", satisfaction: "200" },
                { label: "label2", toleration: "30", satisfaction: "100" }]
            const groupedErrors: GroupedErrors[] = [
                {
                    count: "1", failureMessage: "failure message",
                    responseMessage: "response message", statusCode: "500",
                }]
            const labelErrors: Top5ErrorsRaw[] = [
                {
                    status_code: "500", row_n: "1", cnt: "4", label: "label1", response_message: "failure message",
                    failure_message: "failure message",
                },
                {
                    status_code: "500", row_n: "2", cnt: "1", label: "label1", response_message: "failure message",
                    failure_message: "",
                },
            ]

            const { overview, labelStats } = prepareDataForSavingToDb(overviewData, labelsData, [],
                statusCodes, responseFailures, apdex, groupedErrors, labelErrors)
            expect(overview).toEqual({
                percentil: 271,
                maxVu: undefined,
                avgResponseTime: 106,
                errorRate: 0.01,
                errorCount: 3,
                throughput: 25.9,
                bytesPerSecond: 38820.04,
                bytesSentPerSecond: 68.43,
                avgLatency: 105.62,
                avgConnect: 5.8,
                startDate: new Date("2021-03-29T10:57:10.882Z"),
                endDate: new Date("2021-03-29T11:27:10.171Z"),
                duration: 29.99,
            })
            expect(labelStats).toEqual([
                {
                    label: "label1",
                    samples: 932,
                    avgResponseTime: 287,
                    minResponseTime: 227,
                    maxResponseTime: 1325,
                    errorRate: 0,
                    bytesPerSecond: 0.07,
                    bytesSentPerSecond: 0.73,
                    throughput: 0.55,
                    n9: 418,
                    n5: 367,
                    n0: 343,
                    latency: 1,
                    connect: 2,
                    statusCodes: [{ count: 932, statusCode: "200" }],
                    responseMessageFailures: [{
                        count: 31, responseMessage: "failure", statusCode: "100", failureMessage: "failure",
                    }],
                    apdex: {
                        satisfaction: 200,
                        toleration: 40,
                    },
                },
                {
                    label: "label2",
                    samples: 431,
                    avgResponseTime: 45,
                    minResponseTime: 35,
                    maxResponseTime: 118,
                    errorRate: 0,
                    bytesPerSecond: 0.08,
                    bytesSentPerSecond: 0.78,
                    throughput: 0.27,
                    n9: 93,
                    n5: 56,
                    n0: 50,
                    latency: 3,
                    connect: 4,
                    statusCodes: [{ count: 433, statusCode: "200" }],
                    responseMessageFailures: [{
                        count: 1, responseMessage: "failure2", statusCode: "101", failureMessage: "failure1",
                    }],
                    apdex: {
                        toleration: 30,
                        satisfaction: 100,
                    },
                }])
        })
    })
    describe("transformMonitoringDataForDb", () => {
        it("should parse input data correctly", () => {
            const row = {
                name: "test",
                cpu: "10",
                mem: "5",
                ts: "1555399218",
            }
            const itemId = "myTestId"
            const transformedMonitoringData = transformMonitoringDataForDb(row, itemId)
            expect(transformedMonitoringData).toEqual({
                name: "test",
                cpu: 10,
                mem: 5,
                itemId,
                timestamp: new Date("2019-04-16T07:20:18.000Z"),
            })
        })
        it("should return indefined when an error occurs during parsing", () => {
            const itemId = "myTestId"
            const row = {}
            const transformedMonitoringData = transformMonitoringDataForDb(row, itemId)
            expect(transformedMonitoringData).toBeUndefined()
        })
        it("should return localhost if no name provided", () => {
            const row = {
                cpu: "10",
                mem: "5",
                ts: "1555399218",
            }
            const itemId = "myTestId"
            const transformedMonitoringData = transformMonitoringDataForDb(row, itemId)
            expect(transformedMonitoringData).toEqual({
                name: "localhost",
                cpu: 10,
                mem: 5,
                itemId,
                timestamp: new Date("2019-04-16T07:20:18.000Z"),
            })
        })
    })
    describe("prepareChartDataForSaving", () => {
        it("should correctly parse data", () => {

            const overviewData = [{
                min: new Date("2019-04-16T07:20:18.000Z"),
                max: new Date("2019-04-16T07:20:18.000Z"),
                total: 1000,
                threads: 30,
                avg_response: 30.2,
                time: new Date("2019-04-16T07:20:18.000Z"),
                number_of_failed: 4,
                bytes_received_total: 32423412,
                bytes_sent_total: 342342341,
                error_rate: 1.2,
            }]
            const labelData = [{
                time: new Date("2019-04-16T07:20:18.000Z"),
                label: "test-label",
                min: new Date("2019-04-16T07:20:18.000Z"),
                max: new Date("2019-04-16T07:20:18.000Z"),
                total: 200,
                threads: 30,
                avg_response: 123.2,
                min_response: 12.3,
                max_response: 1233.1,
                bytes_received_total: 32423123,
                bytes_sent_total: 56456546546,
                n50: 60,
                n90: 120.1,
                n95: 251,
                n99: 300.3,
                error_rate: 0.02,
            }]
            const statusCodeData = [{
                time: new Date("2019-04-16T07:20:18.000Z").toString(),
                statusCode: "200",
                count: 10,
            }]
            const threadsPerThreadGroup = [
                {
                    time: new Date("2019-04-16T07:20:18.000Z").toString(),
                    thread_name: "thread name",
                    threads: "1",
                },
                {
                    time: new Date("2019-04-16T07:20:19.000Z").toString(),
                    thread_name: "thread name",
                    threads: "2",
                },
            ]
            const chartData = prepareChartDataForSaving(
                { overviewData, labelData, interval: 450, statusCodeData, threadsPerThreadGroup })
            expect(chartData).toEqual({
                maxResponseTime: [{
                    data: [[1555399218000, 1233.1]],
                    name: "test-label",
                }],
                minResponseTime: [{
                    data: [[1555399218000, 12.3]],
                    name: "test-label",
                }],
                networkDown: [{
                    data: [[1555399218000, 72051384.44]],
                    name: "test-label",
                }],
                networkUp: [{
                    data: [[1555399218000, 125458992324.44]],
                    name: "test-label",
                }],
                networkV2: [{
                    data: [[1555399218000, 125531043708.89]],
                    name: "test-label",
                }],
                overAllFailRate: {
                    data: [[1555399218000, 120]],
                    name: "errors",
                },
                overAllNetworkDown: {
                    data: [[1555399218000, 72052026.67]],
                    name: "network down",
                },
                overAllNetworkUp: {
                    data: [[1555399218000, 760760757.78]],
                    name: "network up",
                },
                overAllNetworkV2: {
                    data: [[1555399218000, 832812784.44]],
                    name: "network",
                },
                overallThroughput: {
                    data: [[1555399218000, 2222.22]],
                    name: "throughput",
                },
                overallTimeResponse: {
                    data: [[1555399218000, 30.2]],
                    name: "response time",
                },
                percentile50: [{
                    data: [[1555399218000, 60]],
                    name: "test-label",
                }],
                percentile90: [{
                    data: [[1555399218000, 120.1]],
                    name: "test-label",
                }],
                percentile95: [{
                    data: [[1555399218000, 251]],
                    name: "test-label",
                }],
                percentile99: [{
                    data: [[1555399218000, 300.3]],
                    name: "test-label",
                }],
                responseTime: [{
                    data: [[1555399218000, 123.2]],
                    name: "test-label",
                }],
                threads: [[1555399218000, 30]],
                throughput: [{
                    data: [[1555399218000, 444.44]],
                    name: "test-label",
                }],
                statusCodes: [{
                    data: [[1555399218000, 10]],
                    name: "200",
                }],
                errorRate: [{
                    data: [[1555399218000, 2]],
                    name: "test-label",
                }],
            })
        })
    })
    describe("prepareHistogramDataForSaving", () => {
        it("should should correctly parse data", () => {
            const inputData = [{ label: "label1", histogram: [0, 1, 30, 3, 0] },
                { label: "label2", histogram: [0, 30, 0, 5, 10, 2, 0] }]
            const parsedData = prepareHistogramDataForSaving(inputData)
            expect(parsedData).toEqual({
                responseTimePerLabelDistribution: [
                    { label: "label1", values: [1, 30, 3] },
                    { label: "label2", values: [30, 0, 5, 10, 2] },
                ],
            })
        })
    })
})
