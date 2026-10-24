import * as request from "supertest"
import { stateSetup, userSetup, apiTokenSetup } from "./helper/state"
import { States } from "./helper/state.model"
import { ItemStatus, ReportStatus } from "../../server/queries/items.model"
import { createNewItem } from "../../server/queries/items"
import { db } from "../../db/db"
import * as path from "path"
import { StatusCode } from "../../server/utils/status-code"

const TIMEOUT = 2000

describe("Items", () => {
  let credentials
  let token
  beforeAll(async () => {
    try {
      ({ data: credentials } = await userSetup());
      ({ data: { token } } = await apiTokenSetup())
    } catch(error) {
      console.log(error)
    }
  })

  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, TIMEOUT))
  })

  describe("POST /api/projects/:projectName/scenarios/:scenarioName/items/start-async", () => {
    it("should be able to start async item", async () => {
      await stateSetup(States.ExistingScenario)
      await request(__server__)
        .post("/api/projects/test-project/scenarios/test-scenario/items/start-async")
        .set(__tokenHeaderKey__, token)
        .set("Accept", "application/json")
        .send({ environment: "test" })
        .expect(StatusCode.Created)
    })
    it("should return 404 when project does not exist", async () => {
      await stateSetup(States.ExistingScenario)
      await request(__server__)
          .post("/api/projects/test-project-1/scenarios/test-scenario/items/start-async")
          .set(__tokenHeaderKey__, token)
          .set("Accept", "application/json")
          .send({ environment: "test" })
          .expect(StatusCode.NotFound)
    })
  })
  describe("POST /api/projects/:projectName/scenarios/:scenarioName/items/{itemId}/stop-async", () => {
    it("should be able to stop async item", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
          .post(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}/stop-async`)
          .set(__tokenHeaderKey__, token)
          .set("Accept", "application/json")
          .send({ status: "1" })
          .expect(StatusCode.Ok)
    })
    it("should return 404 when project does not exist", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
          .post(`/api/projects/test-project-1/scenarios/test-scenario/items/${itemId}/stop-async`)
          .set(__tokenHeaderKey__, token)
          .set("Accept", "application/json")
          .send({ status: "1" })
          .expect(StatusCode.NotFound)
    })
  })
  describe("PUT /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}", () => {
    it("should be able to update test item", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
        .put(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}`)
        .set(__tokenHeaderKey__, credentials.token)
        .set("Accept", "application/json")
        .send({
          environment: "new-test-environment",
          note: "new-test-note",
          base: true,
          status: "10",
        })
        .expect(StatusCode.NoContent)
    })
    it("should return 404 when project does not exist", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
          .put(`/api/projects/test-project-1/scenarios/test-scenario/items/${itemId}`)
          .set(__tokenHeaderKey__, credentials.token)
          .set("Accept", "application/json")
          .send({
            environment: "new-test-environment",
            note: "new-test-note",
            base: true,
            status: "10",
          })
          .expect(StatusCode.NotFound)
    })
  })
  describe("DELETE /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}", () => {
    it("should be able to delete test item", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
        .delete(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}`)
        .set(__tokenHeaderKey__, credentials.token)
        .set("Accept", "application/json")
        .send({
          environment: "new-test-environment",
          note: "new-test-note",
          base: true,
        })
        .expect(StatusCode.NoContent)
    })
    it("should return 404 when project does not exist", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
          .delete(`/api/projects/test-project-1/scenarios/test-scenario/items/${itemId}`)
          .set(__tokenHeaderKey__, credentials.token)
          .set("Accept", "application/json")
          .send({
            environment: "new-test-environment",
            note: "new-test-note",
            base: true,
          })
          .expect(StatusCode.NotFound)
    })
  })
  describe("DELETE /projects/{projectName}/scenarios/{scenarioName}/items", () => {
    it("should delete multiple items and be idempotent", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      const [secondItem] = await db.any(createNewItem(
        "test-scenario", "2019-09-22 20:21:23.265", "localhost", "second test note",
        "1", "test-project", "localhost", ReportStatus.Ready, "second-test-name", "resourcesLink"))

      const path = "/api/projects/test-project/scenarios/test-scenario/items"
      await request(__server__)
        .delete(path)
        .set(__tokenHeaderKey__, credentials.token)
        .set("Accept", "application/json")
        .send({ itemIds: [itemId, secondItem.id] })
        .expect(StatusCode.NoContent)

      const items = await request(__server__)
        .get(path)
        .set(__tokenHeaderKey__, credentials.token)
        .set("Accept", "application/json")
        .expect(StatusCode.Ok)
      expect(items.body).toMatchObject({ data: [], total: 0 })

      await request(__server__)
        .delete(path)
        .set(__tokenHeaderKey__, credentials.token)
        .set("Accept", "application/json")
        .send({ itemIds: [itemId, secondItem.id] })
        .expect(StatusCode.NoContent)
    })

    it("should reject invalid, empty, and oversized batches", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      const path = "/api/projects/test-project/scenarios/test-scenario/items"

      for (const itemIds of [["invalid"], [], Array(101).fill(itemId)]) {
        await request(__server__)
          .delete(path)
          .set(__tokenHeaderKey__, credentials.token)
          .set("Accept", "application/json")
          .send({ itemIds })
          .expect(StatusCode.BadRequest)
      }
    })
  })
  describe("POST /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}/share-tokens", () => {
    it("should be able to create new share token", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
        .post(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}/share-tokens`)
        .set(__tokenHeaderKey__, credentials.token)
        .set("Accept", "application/json")
        .send({
          name: "test-token",
        })
        .expect(StatusCode.Created)
    })
    it("should return 404 when project does not exist", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
          .post(`/api/projects/test-project-1/scenarios/test-scenario/items/${itemId}/share-tokens`)
          .set(__tokenHeaderKey__, credentials.token)
          .set("Accept", "application/json")
          .send({
            name: "test-token",
          })
          .expect(StatusCode.NotFound)
    })
  })
  describe("POST /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}/custom-chart-settings", () => {
    it("should be able to upsert chart settings", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
        .post(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}/custom-chart-settings`)
        .set(__tokenHeaderKey__, credentials.token)
        .set("Accept", "application/json")
        .send([{ name: "test", metric: "test" }])
        .expect(StatusCode.Ok)
    })
    it("should return 404 when project does not exist", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
          .post(`/api/projects/test-project-1/scenarios/test-scenario/items/${itemId}/custom-chart-settings`)
          .set(__tokenHeaderKey__, credentials.token)
          .set("Accept", "application/json")
          .send([{ name: "test", metric: "test" }])
          .expect(StatusCode.NotFound)
    })
  })
  describe("GET /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}/custom-chart-settings", () => {
    it("should be able to upsert chart settings", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
        .get(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}/custom-chart-settings`)
        .set(__tokenHeaderKey__, credentials.token)
        .set("Accept", "application/json")
        .expect(StatusCode.Ok)
    })
    it("should return 404 when project does not exist", async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
      await request(__server__)
          .get(`/api/projects/test-project-1/scenarios/test-scenario/items/${itemId}/custom-chart-settings`)
          .set(__tokenHeaderKey__, credentials.token)
          .set("Accept", "application/json")
          .expect(StatusCode.NotFound)
    })
  })
  describe("POST /projects/{projectName}/scenarios/{scenarioName}/items", () => {
    it("should be able to create test item", async () => {
      await stateSetup(States.ExistingScenario)
      await request(__server__)
        .post("/api/projects/test-project/scenarios/test-scenario/items")
        .set(__tokenHeaderKey__, credentials.token)
        .attach("kpi", path.join(__dirname, "./test-data/kpi.jtl"), "kpi.jtl")
        .field("environment", "test-environment")
        .field("note", "test-note")
        .field("status", ItemStatus.Passed)
        .field("hostname", "localhost")
        .expect(StatusCode.Ok)
    })
    it("should be able to create test item with more test columns", async () => {
      await stateSetup(States.ExistingScenario)
      await request(__server__)
        .post("/api/projects/test-project/scenarios/test-scenario/items")
        .set(__tokenHeaderKey__, credentials.token)
        .attach("kpi", path.join(__dirname, "./test-data/kpi.jtl"), "kpi1.jtl")
        .field("environment", "test-environment")
        .field("note", "test-note")
        .field("status", ItemStatus.Passed)
        .field("hostname", "localhost")
        .expect(StatusCode.Ok)
    })
    it("should be able to create test item with api token", async () => {
      await stateSetup(States.ExistingScenario)
      await request(__server__)
        .post("/api/projects/test-project/scenarios/test-scenario/items")
        .set(__tokenHeaderKey__, token)
        .attach("kpi", path.join(__dirname, "./test-data/kpi.jtl"), "kpi.jtl")
        .field("environment", "test-environment")
        .field("note", "test-note")
        .field("status", ItemStatus.Passed)
        .field("hostname", "localhost")
        .expect(StatusCode.Ok)
    })
    it("should return 404 when project does not exist", async () => {
      await stateSetup(States.ExistingScenario)
      await request(__server__)
          .post("/api/projects/test-project-1/scenarios/test-scenario/items")
          .set(__tokenHeaderKey__, credentials.token)
          .attach("kpi", path.join(__dirname, "./test-data/kpi.jtl"), "kpi.jtl")
          .field("environment", "test-environment")
          .field("note", "test-note")
          .field("status", ItemStatus.Passed)
          .field("hostname", "localhost")
          .expect(StatusCode.NotFound)
    })
  })
})
