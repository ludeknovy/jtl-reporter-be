import * as request from "supertest"
import { stateSetup, userSetup } from "./helper/state"
import { States } from "./helper/state.model"
import { StatusCode } from "../../server/utils/status-code"

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
})
