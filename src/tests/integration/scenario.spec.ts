import * as request from "supertest"
import { stateSetup, userSetup } from "./helper/state"
import { StatusCode } from "../../server/utils/status-code"
import { States } from "./helper/state.model"

describe("Scenario", () => {
    let credentials
    beforeAll(async () => {
        ({ data: credentials } = await userSetup())
    })
    describe("POST /projects/{projectName}/scenarios", () => {
        it("should be able to create new scenario", async () => {
            await stateSetup(States.ExistingProject)
            await request(__server__)
                .post("/api/projects/test-project/scenarios")
                .set(__tokenHeaderKey__, credentials.token)
                .send({ scenarioName: "test-scenario" })
                .set("Accept", "application/json")
                .expect(StatusCode.Created)
        })
        it("should not be able to create two scenarios with same name", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .post("/api/projects/test-project/scenarios")
                .set(__tokenHeaderKey__, credentials.token)
                .send({ scenarioName: "test-scenario" })
                .set("Accept", "application/json")
                .expect(StatusCode.Conflict)
        })
        it("should return 400 when no scenarioName provided", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .post("/api/projects/test-project/scenarios")
                .set(__tokenHeaderKey__, credentials.token)
                .send({})
                .set("Accept", "application/json")
                .expect(StatusCode.BadRequest)
        })
        it("should return 404 when project does not exist", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .post("/api/projects/test-project-1/scenarios")
                .set(__tokenHeaderKey__, credentials.token)
                .send({ scenarioName: "test-scenario" })
                .set("Accept", "application/json")
                .expect(StatusCode.NotFound)
        })
    })
    describe("PUT /projects/{projectName}/scenarios/{scenarioName}", () => {
        it("should be able to update scenario", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .put("/api/projects/test-project/scenarios/test-scenario")
                .set(__tokenHeaderKey__, credentials.token)
                .send({
                    scenarioName: "test-scenario",
                    analysisEnabled: false,
                    zeroErrorToleranceEnabled: true,
                    deleteSamples: false,
                    keepTestRunsPeriod: 7,
                    generateShareToken: true,
                    extraAggregations: false,
                    thresholds: {
                        enabled: true,
                        percentile: 4.2,
                        errorRate: 4.2,
                        throughput: 8.3,
                    },
                    labelTrendChartSettings: {
                        avgConnectionTime: true,
                        avgLatency: true,
                        avgResponseTime: true,
                        errorRate: true,
                        p90: true,
                        p95: true,
                        p99: true,
                        throughput: false,
                        virtualUsers: true,
                    },
                    userSettings: {
                        requestStats: {
                            samples: true,
                            avg: true,
                            min: true,
                            max: true,
                            p90: true,
                            p95: true,
                            p99: true,
                            throughput: true,
                            network: true,
                            errorRate: true,
                            failures: true,
                            apdex: true,
                            standardDeviation: true,
                        },
                    },
                    apdexSettings: {
                        toleratingThreshold: 200,
                        satisfyingThreshold: 50,
                        enabled: true,
                    },
                })
                .set("Accept", "application/json")
                .expect(StatusCode.NoContent)
        })
        it("should return 404 when project does not exist", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .put("/api/projects/test-project-1/scenarios/test-scenario")
                .set(__tokenHeaderKey__, credentials.token)
                .send({
                    scenarioName: "test-scenario",
                    analysisEnabled: false,
                    zeroErrorToleranceEnabled: true,
                    deleteSamples: false,
                    keepTestRunsPeriod: 7,
                    generateShareToken: true,
                    extraAggregations: false,
                    thresholds: {
                        enabled: true,
                        percentile: 4.2,
                        errorRate: 4.2,
                        throughput: 8.3,
                    },
                    labelTrendChartSettings: {
                        avgConnectionTime: true,
                        avgLatency: true,
                        avgResponseTime: true,
                        errorRate: true,
                        p90: true,
                        p95: true,
                        p99: true,
                        throughput: false,
                        virtualUsers: true,
                    },
                    userSettings: {
                        requestStats: {
                            samples: true,
                            avg: true,
                            min: true,
                            max: true,
                            p90: true,
                            p95: true,
                            p99: true,
                            throughput: true,
                            network: true,
                            errorRate: true,
                            failures: true,
                            apdex: true,
                            standardDeviation: true,
                        },
                    },
                    apdexSettings: {
                        toleratingThreshold: 200,
                        satisfyingThreshold: 50,
                        enabled: true,
                    },
                })
                .set("Accept", "application/json")
                .expect(StatusCode.NotFound)
        })
    })
    describe("POST /projects/{projectName}/scenarios/{scenarioName}/trends/settings", () => {
        it("should be able to update scenario trends settings", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .post("/api/projects/test-project/scenarios/test-scenario/trends/settings")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .send({
                    aggregatedTrends: true,
                    labelMetrics: {
                        errorRate: true,
                        throughput: true,
                        percentile90: false,
                    },
                })
                .expect(StatusCode.NoContent)
        })
        it("should return 404 when project does not exist", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .post("/api/projects/test-project-1/scenarios/test-scenario/trends/settings")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .send({
                    aggregatedTrends: true,
                    labelMetrics: {
                        errorRate: true,
                        throughput: true,
                        percentile90: false,
                    },
                })
                .expect(StatusCode.NotFound)
        })
    })
    describe("DELETE /projects/{projectName}/scenarios/{scenarioName}", () => {
        it("should be able to delete scenario", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .delete("/api/projects/test-project/scenarios/test-scenario")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.NoContent)
        })
        it("should return 404 when project does not exist", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .delete("/api/projects/test-project-1/scenarios/test-scenario")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.NotFound)
        })
    })
})
