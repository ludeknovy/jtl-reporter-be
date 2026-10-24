import * as request from "supertest"
import { States } from "./helper/state.model"
import { stateSetup, userSetup } from "./helper/state"
import { StatusCode } from "../../server/utils/status-code"


describe("Projects", () => {
    let credentials
    beforeAll(async () => {
        ({ data: credentials } = await userSetup())
    })
    describe("GET /projects", () => {
        it("should return projects available to the authenticated user", async () => {
            await stateSetup(States.ExistingProject)
            const response = await request(__server__)
                .get("/api/projects")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.Ok)

            expect(Array.isArray(response.body)).toEqual(true)
        })
    })
    describe("GET /projects/{projectName}", () => {
        it("should return project settings", async () => {
            await stateSetup(States.ExistingProject)
            await request(__server__)
                .get("/api/projects/test-project")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.Ok)
        })
    })
    describe("GET /projects/overall-stats", () => {
        it("should return dashboard statistics", async () => {
            await stateSetup(States.ExistingProject)
            const response = await request(__server__)
                .get("/api/projects/overall-stats")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.Ok)

            expect(response.body).toEqual(expect.objectContaining({
                avgDuration: expect.any(Number),
                avgVu: expect.any(Number),
                totalDuration: expect.any(Number),
                totalRunCount: expect.any(Number),
            }))
        })
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
                .expect(StatusCode.NotFound)
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
                .expect(StatusCode.NotFound)
        })
    })
})
