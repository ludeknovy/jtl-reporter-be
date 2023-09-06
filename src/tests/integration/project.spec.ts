import * as request from "supertest"
import { States } from "./helper/state.model"
import { stateSetup, userSetup } from "./helper/state"
import { StatusCode } from "../../server/utils/status-code"


describe("Projects", () => {
    let credentials
    beforeAll(async () => {
        ({ data: credentials } = await userSetup())
    })
    describe("POST /projects", () => {
        it("should be able to create new project", async () => {
            await stateSetup(States.EmptyDb)
            await request(__server__)
                .post("/api/projects")
                .set(__tokenHeaderKey__, credentials.token)
                .send({ projectName: "test-project-000" })
                .set("Accept", "application/json")
                .expect(StatusCode.Created)
        })
        it("should return 400 when no projectName provided", async () => {
            await stateSetup(States.EmptyDb)
            await request(__server__)
                .post("/api/projects")
                .set(__tokenHeaderKey__, credentials.token)
                .send({})
                .set("Accept", "application/json")
                .expect(StatusCode.BadRequest)
        })
        it("should not be able to create two project with same name", async () => {
            await stateSetup(States.ExistingProject)
            await request(__server__)
                .post("/api/projects")
                .set(__tokenHeaderKey__, credentials.token)
                .send({ projectName: "test-project" })
                .set("Accept", "application/json")
                .expect(StatusCode.Conflict)
        })
    })
    describe("PUT /projects/${projectName}", () => {
        it("should be able to update project", async () => {
            await stateSetup(States.ExistingProject)
            await request(__server__)
                .put("/api/projects/test-project")
                .set(__tokenHeaderKey__, credentials.token)
                .send({ projectName: "test-project", upsertScenario: true, projectMembers: [] })
                .set("Accept", "application/json")
                .expect(StatusCode.NoContent)
        })
        it("should return 404 when project does not exist", async () => {
            await stateSetup(States.ExistingProject)
            await request(__server__)
                .put("/api/projects/test-project-1")
                .set(__tokenHeaderKey__, credentials.token)
                .send({ projectName: "test-project", upsertScenario: true, projectMembers: [] })
                .set("Accept", "application/json")
                .expect(StatusCode.NoContent)
        })
    })
    describe("DELETE /projects/${projectName}", () => {
        it("should be able to delete project", async () => {
            await stateSetup(States.ExistingProject)
            await request(__server__)
                .delete("/api/projects/test-project")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.NoContent)
        })
        it("should return 404 when project does not exist", async () => {
            await stateSetup(States.ExistingProject)
            await request(__server__)
                .delete("/api/projects/test-project-1")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.NoContent)
        })
    })
})
