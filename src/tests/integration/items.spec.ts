import * as request from "supertest"
import { stateSetup, userSetup, apiTokenSetup } from "./helper/state"
import { States } from "./helper/state.model"
import { ItemStatus, ReportStatus } from "../../server/queries/items.model"
import * as path from "path"
import { StatusCode } from "../../server/utils/status-code"

const TIMEOUT = 2000
const POLL_INTERVAL = 100
const PROCESSING_TIMEOUT = 15000
const PROJECT_NAME = "test-project"
const SCENARIO_NAME = "test-scenario"

const wait = (timeout: number): Promise<void> => new Promise(resolve => setTimeout(resolve, timeout))

const scenarioSettings = (extraAggregations: boolean) => ({
  scenarioName: SCENARIO_NAME,
  analysisEnabled: false,
  zeroErrorToleranceEnabled: false,
  deleteSamples: false,
  keepTestRunsPeriod: 0,
  minTestDuration: 0,
  generateShareToken: false,
  extraAggregations,
  thresholds: {
    enabled: false,
    percentile: 0,
    errorRate: 0,
    throughput: 0,
  },
  labelTrendChartSettings: {
    avgConnectionTime: false,
    avgLatency: false,
    avgResponseTime: false,
    errorRate: false,
    p90: false,
    p95: false,
    p99: false,
    throughput: false,
    virtualUsers: false,
  },
  apdexSettings: {
    toleratingThreshold: 0,
    satisfyingThreshold: 0,
    enabled: false,
  },
})

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

  const waitForProcessedItem = async (itemId: string) => {
    const deadline = Date.now() + PROCESSING_TIMEOUT

    while (Date.now() < deadline) {
      const response = await request(__server__)
        .get(`/api/projects/${PROJECT_NAME}/scenarios/${SCENARIO_NAME}/items/${itemId}`)
        .set(__tokenHeaderKey__, credentials.token)

      if (response.status === StatusCode.Ok && response.body.reportStatus === ReportStatus.Ready) {
        return response.body
      }

      await wait(POLL_INTERVAL)
    }

    throw new Error(`Item ${itemId} did not finish processing within ${PROCESSING_TIMEOUT}ms`)
  }

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

  describe("item data processing", () => {
    const updateScenario = async (extraAggregations: boolean) => {
      await request(__server__)
        .put(`/api/projects/${PROJECT_NAME}/scenarios/${SCENARIO_NAME}`)
        .set(__tokenHeaderKey__, credentials.token)
        .send(scenarioSettings(extraAggregations))
        .expect(StatusCode.NoContent)
    }

    const createItem = async (filename: string) => {
      const response = await request(__server__)
        .post(`/api/projects/${PROJECT_NAME}/scenarios/${SCENARIO_NAME}/items`)
        .set(__tokenHeaderKey__, credentials.token)
        .attach("kpi", path.join(__dirname, "./test-data", filename), filename)
        .field("environment", "test-environment")
        .field("status", ItemStatus.Passed)
        .expect(StatusCode.Ok)

      return response.body.itemId
    }

    const uploadItem = async (extraAggregations: boolean, filename: string) => {
      await stateSetup(States.ExistingScenario)
      await updateScenario(extraAggregations)

      return waitForProcessedItem(await createItem(filename))
    }

    it("persists extra chart data when extra aggregations are enabled", async () => {
      const item = await uploadItem(true, "kpi1.jtl")

      expect(item.plot.threads).not.toHaveLength(0)
      expect(item.extraPlotData.length).toBeGreaterThan(0)
    })

    it("persists only the default chart interval when extra aggregations are disabled", async () => {
      const item = await uploadItem(false, "kpi.jtl")

      expect(item.plot.threads).not.toHaveLength(0)
      expect(item.extraPlotData).toEqual([])
    })

    it("processes concurrent uploads without leaving either report in progress", async () => {
      await stateSetup(States.ExistingScenario)
      await updateScenario(false)

      const itemIds = await Promise.all([createItem("kpi.jtl"), createItem("kpi.jtl")])
      const items = await Promise.all(itemIds.map(waitForProcessedItem))

      items.forEach(item => expect(item.plot.threads).not.toHaveLength(0))
    })
  })
})
