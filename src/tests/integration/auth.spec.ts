import * as request from "supertest"
import { apiTokenSetup, userSetup } from "./helper/state"
import { routes } from "./helper/routes"
import * as assert from "assert"
import { StatusCode } from "../../server/utils/status-code"

describe("Auth", () => {
  let credentials
  let token
  beforeAll(async () => {
    ({ data: credentials } = await userSetup());
    ({ data: { token } } = await apiTokenSetup())
  })
  describe("Login", () => {
    it("should be able to login with valid credentials", async () => {
      await request(__server__)
        .post(routes.auth.login)
        .send({
          username: credentials.username,
          password: credentials.password,
        })
        .expect(StatusCode.Ok)
    })
    it("should not be able to login without valid credentials", async () => {
      await request(__server__)
        .post(routes.auth.login)
        .send({
          username: credentials.username,
          password: "test",
        })
        .expect(StatusCode.Unathorized)
    })
    it("should return 400 when invalid payload provided", async () => {
      await request(__server__)
        .post(routes.auth.login)
        .send({})
        .expect(StatusCode.BadRequest)
    })
  })
  describe("Change password", () => {
    it("should not be able to change password when unathorized", async () => {
      await request(__server__)
        .post(routes.auth.changePassword)
        .send({
          currentPassword: credentials.password,
          newPassword: "test123",
        })
        .expect(StatusCode.Unathorized)
    })
    it("should not be able to change password when is not long enough", async () => {
      await request(__server__)
        .post(routes.auth.changePassword)
        .set(__tokenHeaderKey__, credentials.token)
        .send({
          currentPassword: credentials.password,
          newPassword: "test123",
        })
        .expect(StatusCode.BadRequest)
    })
    describe("Change password flow", () => {
      const newPassword = "test12345"
      it("should be able to change password", async () => {
        await request(__server__)
          .post(routes.auth.changePassword)
          .set(__tokenHeaderKey__, credentials.token)
          .send({
            currentPassword: credentials.password,
            newPassword,
          })
          .expect(StatusCode.NoContent)
      })
      it("should not be able log in with old password", async () => {
        await request(__server__)
          .post(routes.auth.login)
          .send({
            username: credentials.username,
            password: credentials.password,
          })
          .expect(StatusCode.Unathorized)
      })
      it("should be be able to log in with new password", async () => {
        await request(__server__)
          .post(routes.auth.login)
          .send({
            username: credentials.username,
            password: newPassword,
          })
          .expect(StatusCode.Ok)
      })
    })
  })
  describe("Login with token", () => {
    it("should be able to login with valid token", async () => {
      await request(__server__)
        .post(routes.auth.loginWithToken)
        .send({ token })
        .expect(StatusCode.Ok)
        .then((r) => {
          assert.ok(r.body.jwtToken.length > 0)
        })
    })
    it("should not be able to login with invalid token", async () => {
      await request(__server__)
        .post(routes.auth.loginWithToken)
        .send({ token: "at-test" })
        .expect(StatusCode.Unathorized)
    })
  })
})
