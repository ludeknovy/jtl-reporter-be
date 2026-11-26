import * as request from "supertest"
import { stateSetup, userSetup } from "./helper/state"
import { States } from "./helper/state.model"
import { StatusCode } from "../../server/utils/status-code"
import { db } from "../../db/db"
import { createNewProject } from "../../server/queries/projects"
import { createNewScenario } from "../../server/queries/scenario"

describe("Label analytics", () => {
    let credentials

    beforeAll(async () => {
        ({ data: credentials } = await userSetup())
    })

    it("returns trend, virtual-user, and error analytics for an item label", async () => {
        const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
        const endpoint = `/api/projects/test-project/scenarios/test-scenario/items/${itemId}/label/Authorize`

        const trendResponse = await request(__server__)
            .get(`${endpoint}/trend?environment=localhost`)
            .set(__tokenHeaderKey__, credentials.token)
            .set("Accept", "application/json")
            .expect(StatusCode.Ok)
        expect(trendResponse.body).toEqual(expect.objectContaining({
            chartSeries: expect.any(Object),
            chartSettings: expect.any(Object),
        }))

        const virtualUsersResponse = await request(__server__)
            .get(`${endpoint}/virtual-users?environment=localhost`)
            .set(__tokenHeaderKey__, credentials.token)
            .set("Accept", "application/json")
            .expect(StatusCode.Ok)
        expect(virtualUsersResponse.body.result).toEqual(expect.any(Array))

        const errorsResponse = await request(__server__)
            .get(`${endpoint}/errors`)
            .set(__tokenHeaderKey__, credentials.token)
            .set("Accept", "application/json")
            .expect(StatusCode.Ok)
        expect(errorsResponse.body.stat).toEqual(expect.any(Object))
    })

    it("returns 404 for label analytics when item belongs to another project or scenario", async () => {
        const { data: { itemId } } = await stateSetup(States.ExistingTestItem)
        await db.one(createNewProject("other-project"))
        await db.none(createNewScenario("other-project", "other-scenario"))
        await db.none(createNewScenario("test-project", "other-scenario"))

        const wrongEndpoints = [
            `/api/projects/other-project/scenarios/other-scenario/items/${itemId}/label/Authorize`,
            `/api/projects/test-project/scenarios/other-scenario/items/${itemId}/label/Authorize`,
        ]

        for (const endpoint of wrongEndpoints) {
            await request(__server__)
                .get(`${endpoint}/trend?environment=localhost`)
                .set(__tokenHeaderKey__, credentials.token)
                .expect(StatusCode.NotFound)

            await request(__server__)
                .get(`${endpoint}/virtual-users?environment=localhost`)
                .set(__tokenHeaderKey__, credentials.token)
                .expect(StatusCode.NotFound)

            await request(__server__)
                .get(`${endpoint}/errors`)
                .set(__tokenHeaderKey__, credentials.token)
                .expect(StatusCode.NotFound)
        }
    })
})
