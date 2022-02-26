import * as request from "supertest"
import { States } from "../contract/states.model"
import { stateSetup, userSetup } from "./helper/state"
import { StatusCode } from "../../server/utils/status-code"

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
          thresholds: {
            enabled: true,
            percentile: 4.2,
            errorRate: 4.2,
            throughput: 8.3,
          },
        })
        .set("Accept", "application/json")
        .expect(StatusCode.NoContent)
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
  })
})
