import { Response } from "express"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"
import { getScenarioController } from "./get-scenario-controller"

jest.mock("../../../db/db")

const mockResponse = () => {
    const response: Partial<Response> = {}
    response.status = jest.fn().mockReturnValue(response)
    response.json = jest.fn().mockReturnValue(response)
    return response
}

describe("getScenarioController", () => {
    it("maps stored scenario settings and its optional baseline report", async () => {
        const response = mockResponse()
        ;(db.oneOrNone as jest.Mock)
            .mockResolvedValueOnce({
                analysis_enabled: true,
                apdex_settings: { enabled: true },
                delete_samples: false,
                extra_aggregations: true,
                generate_share_token: false,
                keep_test_runs_period: 7,
                label_filter_settings: [],
                label_trend_chart_settings: { p90: true },
                min_test_duration: 30,
                name: "scenario",
                threshold_enabled: true,
                threshold_error_rate: 5,
                threshold_percentile: 90,
                threshold_throughput: 10,
                zero_error_tolerance_enabled: false,
            })
            .mockResolvedValueOnce({ id: "baseline-item" })

        await getScenarioController({
            params: { projectName: "project", scenarioName: "scenario" },
        } as any, response as Response)

        expect(response.status).toHaveBeenCalledWith(StatusCode.Ok)
        expect(response.json).toHaveBeenCalledWith({
            analysisEnabled: true,
            apdexSettings: { enabled: true },
            baselineReport: "baseline-item",
            deleteSamples: false,
            extraAggregations: true,
            generateShareToken: false,
            keepTestRunsPeriod: 7,
            labelFilterSettings: [],
            labelTrendChartSettings: { p90: true },
            minTestDuration: 30,
            name: "scenario",
            thresholds: { enabled: true, errorRate: 5, percentile: 90, throughput: 10 },
            zeroErrorToleranceEnabled: false,
        })
    })
})
