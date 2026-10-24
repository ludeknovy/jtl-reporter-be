import * as request from "supertest"
import { stateSetup, userSetup } from "./helper/state"
import { States } from "./helper/state.model"
import { StatusCode } from "../../server/utils/status-code"

describe("Item reads", () => {
  let credentials

  beforeAll(async () => {
    ({ data: credentials } = await userSetup())
  })

  it("returns completed items and their total count", async () => {
    await stateSetup(States.ExistingTestItem)
    const response = await request(__server__)
      .get("/api/projects/test-project/scenarios/test-scenario/items?environment=localhost")
      .set(__tokenHeaderKey__, credentials.token)
      .set("Accept", "application/json")
      .expect(StatusCode.Ok)

    expect(response.body).toEqual(expect.objectContaining({
      data: expect.any(Array),
      name: "test-scenario",
      total: 1,
    }))
  })

  it("returns detail, processing state, and share tokens for an existing item", async () => {
    const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
    const itemEndpoint = `/api/projects/test-project/scenarios/test-scenario/items/${itemId}`
    const itemResponse = await request(__server__)
      .get(itemEndpoint)
      .set(__tokenHeaderKey__, credentials.token)
      .set("Accept", "application/json")
      .expect(StatusCode.Ok)
    expect(itemResponse.body).toEqual(expect.objectContaining({
      environment: "localhost",
      name: "test-name",
      reportStatus: "ready",
      statistics: expect.any(Array),
    }))

    const processingResponse = await request(__server__)
      .get("/api/projects/test-project/scenarios/test-scenario/processing-items?environment=localhost")
      .set(__tokenHeaderKey__, credentials.token)
      .set("Accept", "application/json")
      .expect(StatusCode.Ok)
    expect(processingResponse.body).toEqual({ failed: [], inprogress: [] })

    const tokensResponse = await request(__server__)
      .get(`${itemEndpoint}/share-tokens`)
      .set(__tokenHeaderKey__, credentials.token)
      .set("Accept", "application/json")
      .expect(StatusCode.Ok)
    expect(tokensResponse.body).toEqual([])
  })
})
