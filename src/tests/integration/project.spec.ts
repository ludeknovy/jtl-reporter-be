import * as request from "supertest"
import { States } from "./helper/state.model"
import { stateSetup, userSetup } from "./helper/state"
import { StatusCode } from "../../server/utils/status-code"
import { db } from "../../db/db"
import { createNewProject } from "../../server/queries/projects"
import { createNewScenario } from "../../server/queries/scenario"
import { createNewItem, saveItemStats } from "../../server/queries/items"
import { ReportStatus } from "../../server/queries/items.model"
import { addProjectMember, assignAllAdminsAsProjectMembers } from "../../server/queries/user-project-access"
import { createUserInDB } from "../../server/controllers/users/create-new-user-controller"
import { AllowedRoles } from "../../server/middleware/authorization-middleware"
import { getUser } from "../../server/queries/auth"
import { generateToken } from "../../server/controllers/auth/helper/token-generator"
import { testStats } from "../../test-data/test-stats"


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

        it("should scope dashboard statistics only to projects the user has access to", async () => {
            const RESTRICTED_MAX_VU = 40
            const RESTRICTED_DURATION = 20
            const EXPECTED_ADMIN_RUN_COUNT = 2

            await stateSetup(States.ExistingTestItem)

            const restrictedProject = await db.one(createNewProject("restricted-project"))
            await db.any(assignAllAdminsAsProjectMembers(restrictedProject.id))
            await db.none(createNewScenario("restricted-project", "restricted-scenario"))
            const restrictedItem = await db.one(createNewItem(
                "restricted-scenario", "2020-01-01 10:00:00.000", "localhost", "restricted note",
                "1", "restricted-project", "localhost", ReportStatus.Ready, "restricted-run", "resourcesLink"))
            await db.none(saveItemStats(
                restrictedItem.id,
                JSON.stringify(testStats),
                JSON.stringify({ maxVu: RESTRICTED_MAX_VU, duration: RESTRICTED_DURATION }),
                JSON.stringify([]),
                JSON.stringify([])))

            await createUserInDB("readonly-scoped", "Password123!", AllowedRoles.Readonly)
            const scopedUser = await db.one(getUser("readonly-scoped"))
            await db.none(addProjectMember(restrictedProject.id, scopedUser.id))
            const scopedToken = generateToken(scopedUser.id)

            await createUserInDB("readonly-no-access", "Password123!", AllowedRoles.Readonly)
            const noAccessUser = await db.one(getUser("readonly-no-access"))
            const noAccessToken = generateToken(noAccessUser.id)

            const scopedResponse = await request(__server__)
                .get("/api/projects/overall-stats")
                .set(__tokenHeaderKey__, scopedToken)
                .set("Accept", "application/json")
                .expect(StatusCode.Ok)
            expect(scopedResponse.body).toEqual({
                avgVu: RESTRICTED_MAX_VU,
                avgDuration: RESTRICTED_DURATION,
                totalDuration: RESTRICTED_DURATION,
                totalRunCount: 1,
            })

            const noAccessResponse = await request(__server__)
                .get("/api/projects/overall-stats")
                .set(__tokenHeaderKey__, noAccessToken)
                .set("Accept", "application/json")
                .expect(StatusCode.Ok)
            expect(noAccessResponse.body).toEqual({
                avgVu: 0,
                avgDuration: 0,
                totalDuration: 0,
                totalRunCount: 0,
            })

            const adminResponse = await request(__server__)
                .get("/api/projects/overall-stats")
                .set(__tokenHeaderKey__, credentials.token)
                .set("Accept", "application/json")
                .expect(StatusCode.Ok)
            expect(adminResponse.body.totalRunCount).toBe(EXPECTED_ADMIN_RUN_COUNT)
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
