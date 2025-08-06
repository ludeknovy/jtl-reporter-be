import * as request from "supertest"
import { stateSetup, userSetup } from "./helper/state"
import { StatusCode } from "../../server/utils/status-code"
import { States } from "./helper/state.model"
import { v4 as uuidv4 } from "uuid"

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
                    minTestDuration: 5,
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
                    minTestDuration: 5,
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
    describe("PUT /projects/{projectName}/scenarios/{scenarioName}/user-settings", () => {
        it("should be able to update scenario user settings", async () => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .put("/api/projects/test-project/scenarios/test-scenario/user-settings")
                .set(__tokenHeaderKey__, credentials.token)
                .send({
                    requestStats: {
                        samples: true,
                        avg: true,
                        min: true,
                        max: true,
                        p50: true,
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
                })
                .set("Accept", "application/json")
                .expect(StatusCode.NoContent)
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
    describe(`POST /projects/{projectName}/scenarios/{scenarioName}/share-token`, () => {
        it("should be able to create new token", async() => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .post("/api/projects/test-project/scenarios/test-scenario/share-token")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .send({
                    note: "my token note",
                })
                .expect(StatusCode.Created)
        })
    })
    describe(`GET /projects/{projectName}/scenarios/{scenarioName}/share-token`, () => {
        it("should be able to get tokens", async() => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .get("/api/projects/test-project/scenarios/test-scenario/share-token")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.Ok)
        })
    })

    describe(`DELETE /projects/{projectName}/scenarios/{scenarioName}/share-token/{tokenId}`, () => {
        it("should return 404 when token not found", async() => {
            await stateSetup(States.ExistingScenario)
            await request(__server__)
                .delete(`/api/projects/test-project/scenarios/test-scenario/share-token/${uuidv4()}`)
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.NotFound)
        })
    })
})
