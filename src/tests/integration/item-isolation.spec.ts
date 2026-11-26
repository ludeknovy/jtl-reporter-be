import * as request from "supertest"
import { stateSetup, userSetup, apiTokenSetup } from "./helper/state"
import { States } from "./helper/state.model"
import { StatusCode } from "../../server/utils/status-code"
import { db } from "../../db/db"
import { createNewProject } from "../../server/queries/projects"
import { createNewScenario } from "../../server/queries/scenario"

const PROJECT_NAME = "test-project"
const SCENARIO_NAME = "test-scenario"
const OTHER_PROJECT = "other-project"
const OTHER_SCENARIO = "other-scenario"

describe("Item cross-project and cross-scenario isolation", () => {
  let credentials
  let token

  beforeAll(async () => {
    ({ data: credentials } = await userSetup());
    ({ data: { token } } = await apiTokenSetup())
  })

  it("rejects item actions across different projects and scenarios without mutating the item", async () => {
    const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
    await db.one(createNewProject(OTHER_PROJECT))
    await db.none(createNewScenario(OTHER_PROJECT, OTHER_SCENARIO))
    await db.none(createNewScenario(PROJECT_NAME, OTHER_SCENARIO))

    await request(__server__)
      .post(`/api/projects/${PROJECT_NAME}/scenarios/${SCENARIO_NAME}/items/${itemId}/share-tokens`)
      .set(__tokenHeaderKey__, credentials.token)
      .set("Accept", "application/json")
      .send({ note: "owner-token" })
      .expect(StatusCode.Created)

    const { body: shareTokens } = await request(__server__)
      .get(`/api/projects/${PROJECT_NAME}/scenarios/${SCENARIO_NAME}/items/${itemId}/share-tokens`)
      .set(__tokenHeaderKey__, credentials.token)
      .expect(StatusCode.Ok)
    const tokenId = shareTokens[0].id

    const wrongBases = [
      `/api/projects/${OTHER_PROJECT}/scenarios/${OTHER_SCENARIO}/items/${itemId}`,
      `/api/projects/${PROJECT_NAME}/scenarios/${OTHER_SCENARIO}/items/${itemId}`,
    ]

    for (const wrongBase of wrongBases) {
      await request(__server__)
        .get(wrongBase)
        .set(__tokenHeaderKey__, credentials.token)
        .expect(StatusCode.NotFound)

      await request(__server__)
        .put(wrongBase)
        .set(__tokenHeaderKey__, credentials.token)
        .send({ environment: "tampered", note: "tampered", base: true, status: "10" })
        .expect(StatusCode.NotFound)

      await request(__server__)
        .delete(wrongBase)
        .set(__tokenHeaderKey__, credentials.token)
        .expect(StatusCode.NotFound)

      await request(__server__)
        .get(`${wrongBase}/request-stats-export`)
        .set(__tokenHeaderKey__, credentials.token)
        .expect(StatusCode.NotFound)

      await request(__server__)
        .post(`${wrongBase}/stop-async`)
        .set(__tokenHeaderKey__, token)
        .send({ status: "1" })
        .expect(StatusCode.NotFound)

      await request(__server__)
        .get(`${wrongBase}/custom-chart-settings`)
        .set(__tokenHeaderKey__, credentials.token)
        .expect(StatusCode.NotFound)

      await request(__server__)
        .post(`${wrongBase}/custom-chart-settings`)
        .set(__tokenHeaderKey__, credentials.token)
        .send([{ name: "test", metric: "test" }])
        .expect(StatusCode.NotFound)

      await request(__server__)
        .delete(`${wrongBase}/share-tokens/${tokenId}`)
        .set(__tokenHeaderKey__, credentials.token)
        .expect(StatusCode.NotFound)
    }

    const originalItem = await request(__server__)
      .get(`/api/projects/${PROJECT_NAME}/scenarios/${SCENARIO_NAME}/items/${itemId}`)
      .set(__tokenHeaderKey__, credentials.token)
      .expect(StatusCode.Ok)
    expect(originalItem.body.environment).toBe("localhost")
    expect(originalItem.body.note).not.toBe("tampered")

    const remainingTokens = await request(__server__)
      .get(`/api/projects/${PROJECT_NAME}/scenarios/${SCENARIO_NAME}/items/${itemId}/share-tokens`)
      .set(__tokenHeaderKey__, credentials.token)
      .expect(StatusCode.Ok)
    expect(remainingTokens.body).toHaveLength(1)
  })
})
