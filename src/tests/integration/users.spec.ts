import * as request from "supertest"
import { userSetup } from "./helper/state"
import { routes } from "./helper/routes"
import * as uuid from "uuid"
import { StatusCode } from "../../server/utils/status-code"

describe("Users", () => {
  let credentials
  beforeAll(async () => {
    ({ data: credentials } = await userSetup())
  })
  describe("POST /users", () => {
    it("should not be able to create new user as unathorized user", async () => {
      await request(__server__)
        .post(routes.users)
        .send({
          username: "new.user",
          password: "test12345",
        })
        .expect(StatusCode.Unathorized)
    })
    it("should be able to create new user", async () => {
      const USERNAME = "new.test.user"
      await request(__server__)
        .post(routes.users)
        .set(__tokenHeaderKey__, credentials.token)
        .send({
          username: USERNAME,
          password: "test12345",
        })
        .expect(StatusCode.Created)

      await request(__server__)
        .get(routes.users)
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(StatusCode.Ok)
        .then(({ body }) => {
          expect(body.find((_) => _.username === USERNAME)).toBeDefined()
        })
    })
    it.each([
      ["too short password", { password: "test", username: "test" }],
      ["too short username", { password: "test12345", username: "te" }],
      ["unallowed character é in username", { password: "test12345", username: "éééééé" }],
      ["unallowed character ? username", { password: "test12345", username: "test?" }],
      ["unallowed character @ in username", { password: "test12345", username: "test@" }],
    ])("should not be able to create new when %s provided", async (desc, body) => {
      await request(__server__)
        .post(routes.users)
        .set(__tokenHeaderKey__, credentials.token)
        .send(body)
        .expect(StatusCode.BadRequest)
    })

  })
  describe("GET /users", () => {
    it("should not be able to get users as unathorized user", async () => {
      await request(__server__)
        .get(routes.users)
        .send()
        .expect(StatusCode.Unathorized)
    })
    it("should be able to get users", async () => {
      await request(__server__)
        .get(routes.users)
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(StatusCode.Ok)
    })
  })
  describe("DELETE /users/:userId", () => {
    it("should return 401 when deleting user as unauthorized", async () => {
      await request(__server__)
        .delete(routes.users + `/${credentials.id}`)
        .send()
        .expect(StatusCode.Unathorized)
    })
    it("should return 404 when deleting unexisting user", async () => {
      await request(__server__)
        .delete(routes.users + `/${uuid()}`)
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(StatusCode.NotFound)
    })
    it("should return 400 when no valid userId provided", async () => {
      await request(__server__)
        .delete(routes.users + "/abcd")
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(StatusCode.BadRequest)
    })
    it("should be able to delete user", async () => {
      await request(__server__)
        .delete(routes.users + `/${credentials.id}`)
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(StatusCode.Ok)
    })
  })
})
