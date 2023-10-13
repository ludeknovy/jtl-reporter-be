import { userSetup } from "./helper/state"
import * as request from "supertest"
import { routes } from "./helper/routes"
import { StatusCode } from "../../server/utils/status-code"

describe("global settings", () => {
    let credentials
    beforeAll(async () => {
        try {
            ({ data: credentials } = await userSetup())
        } catch(error) {
            console.log(error)
        }
    })
    it("should return the global settings", async () => {
        await userSetup()
        await request(__server__)
            .get(routes.globalSettings)
            .set(__tokenHeaderKey__, credentials.token)
            .set("Accept", "application/json")
            .send()
            .expect(StatusCode.Ok, { projectAutoProvisioning: false })
    })
    it("should be able to change the global settings", async () => {
        await userSetup()
        await request(__server__)
            .put(routes.globalSettings)
            .set(__tokenHeaderKey__, credentials.token)
            .set("Accept", "application/json")
            .send({
                projectAutoProvisioning: true,
            })
            .expect(StatusCode.NoContent)
    })
})
