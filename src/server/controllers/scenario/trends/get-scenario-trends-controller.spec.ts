/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { db } from "../../../../db/db"
import { getScenarioTrendsController } from "./get-scenario-trends-controller"

jest.mock("../../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}

describe("getScenarioTrendsController", function () {
    it("should return data", async function () {
        (db.any as any).mockResolvedValueOnce([
            {
                overview: { bytesPerSecond: 100, bytesSentPerSecond: 200, startDate: "2022-02-11T08:33:02.920Z" },
                id: "id2",
            },
            {
                overview: { bytesPerSecond: 100, bytesSentPerSecond: 200, startDate: "2021-11-29T21:25:57.623Z" },
                id: "id1",
            },
        ]);
        (db.manyOrNone as any).mockResolvedValueOnce([]);
        (db.manyOrNone as any).mockResolvedValueOnce([
            { data: [{ label1: 90 }, { label2: 30 }], maxVu: 10 },
            { data: [{ label1: 150 }, { label2: 80 }], maxVu: 100 },
        ])

        const response = mockResponse()
        const request = {
            params: {
                scenarioName: "scenario-name",
                projectName: "project-name",
            },
            user: { userId: "userId" },
        }
        await getScenarioTrendsController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)

        expect(response.json).toBeCalledWith({
            aggregatedTrends: [{
                id: "id1",
                overview: {
                    bytesPerSecond: 100,
                    bytesSentPerSecond: 200,
                    network: 300,
                    startDate: "2021-11-29T21:25:57.623Z",
                },
            }, {
                id: "id2",
                overview: {
                    bytesPerSecond: 100,
                    bytesSentPerSecond: 200,
                    network: 300,
                    startDate: "2022-02-11T08:33:02.920Z",
                },
            }], labelTrends: {}, responseTimeDegradationCurve: [{
                data: [[10, 90], [100, 150]], name: "label1",
            }, {
                data: [[10, 30], [100, 80]], name: "label2",
            }],
            userSettings: { aggregatedTrends: true, labelMetrics: {} },
        })
    })
    it("should return data with label trends when found", async function () {
        (db.any as any).mockResolvedValueOnce([
            {
                overview: { bytesPerSecond: 100, bytesSentPerSecond: 200, startDate: "2022-02-11T08:33:02.920Z" },
                id: "id2",
            },
            {
                overview: { bytesPerSecond: 100, bytesSentPerSecond: 200, startDate: "2021-11-29T21:25:57.623Z" },
                id: "id1",
            },
        ]);
        (db.manyOrNone as any).mockResolvedValueOnce([{
            stats: [{ n0: 10, errorRate: 1, throughput: 1.2, label: "label1" }],
            startDate: "2022-02-11T08:33:02.920Z",
        }])
        const response = mockResponse()
        const request = {
            params: {
                scenarioName: "scenario-name",
                projectName: "project-name",
            },
            user: { userId: "userId" },
        }
        await getScenarioTrendsController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)

        expect(response.json).toBeCalledWith({
            aggregatedTrends: [{
                id: "id1",
                overview: {
                    bytesPerSecond: 100,
                    bytesSentPerSecond: 200,
                    network: 300,
                    startDate: "2021-11-29T21:25:57.623Z",
                },
            }, {
                id: "id2",
                overview: {
                    bytesPerSecond: 100,
                    bytesSentPerSecond: 200,
                    network: 300,
                    startDate: "2022-02-11T08:33:02.920Z",
                },
            }], labelTrends: {
                label1: {
                    errorRate: [[
                        "2022-02-11T08:33:02.920Z",
                        1,
                    ]],
                    percentile90: [[
                        "2022-02-11T08:33:02.920Z",
                        10,
                    ],
                    ],
                    throughput: [[
                        "2022-02-11T08:33:02.920Z",
                        1.2,
                    ]],
                },
            },
            responseTimeDegradationCurve: [],
            userSettings: {
                aggregatedTrends: true,
                labelMetrics: {},
            },
        })
    })
    it("should return user settings", async function () {
        (db.any as any).mockResolvedValueOnce([
            {
                overview: { bytesPerSecond: 100, bytesSentPerSecond: 200, startDate: "2022-02-11T08:33:02.920Z" },
                id: "id2",
            },
            {
                overview: { bytesPerSecond: 100, bytesSentPerSecond: 200, startDate: "2021-11-29T21:25:57.623Z" },
                id: "id1",
            },
        ]);
        (db.manyOrNone as any).mockResolvedValueOnce([]);
        (db.oneOrNone as any).mockResolvedValueOnce({
            scenario_trends_settings:
                {
                    aggregatedTrends: true,
                    labelMetrics: {
                        errorRate: true, percentile90: false, throughput: true,
                    },
                },
        })
        const response = mockResponse()
        const request = {
            params: {
                scenarioName: "scenario-name",
                projectName: "project-name",
            },
            user: { userId: "userId" },
        }
        await getScenarioTrendsController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)

        expect(response.json).toBeCalledWith({
            aggregatedTrends: [{
                id: "id1",
                overview: {
                    bytesPerSecond: 100,
                    bytesSentPerSecond: 200,
                    network: 300,
                    startDate: "2021-11-29T21:25:57.623Z",
                },
            }, {
                id: "id2",
                overview: {
                    bytesPerSecond: 100,
                    bytesSentPerSecond: 200,
                    network: 300,
                    startDate: "2022-02-11T08:33:02.920Z",
                },
            }], labelTrends: {},
            responseTimeDegradationCurve: [],
            userSettings: {
                aggregatedTrends: true,
                labelMetrics: {
                    errorRate: true,
                    percentile90: false,
                    throughput: true,

                },
            },
        })
    })
})

