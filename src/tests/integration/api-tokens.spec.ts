import * as request from "supertest"
import { userSetup } from "./helper/state"
import { routes } from "./helper/routes"
import { StatusCode } from "../../server/utils/status-code"

describe("Api tokens", () => {
  let credentials
  beforeAll(async () => {
    ({ data: credentials } = await userSetup())
  })
  describe("POST /api-tokens", () => {
    it("should not be able to create new api token as unathorized user", async () => {
      await request(__server__)
        .post(routes.apiTokens)
        .send({
          description: "new-api-token",
        })
        .expect(StatusCode.Unathorized)
    })
    it("should not be able to create token when no description provided", async () => {
      await request(__server__)
        .post(routes.apiTokens)
        .set(__tokenHeaderKey__, credentials.token)
        .send({
          description: null,
        })
        .expect(StatusCode.BadRequest)
    })
  })
  it("should be able to create new api token", async () => {
    await request(__server__)
      .post(routes.apiTokens)
      .set(__tokenHeaderKey__, credentials.token)
      .send({
        description: "new-api-token",
      })
      .expect(StatusCode.Created)
    await request(__server__)
      .get(routes.apiTokens)
      .set(__tokenHeaderKey__, credentials.token)
      .send()
      .then(({ body }) => {
        expect(body.length).toEqual(1)
      })
  })

  describe("GET /api-tokens", () => {
    it("should not be able to get api tokens as unauthorized user", async () => {
      await request(__server__)
        .get(routes.apiTokens)
        .send()
        .expect(StatusCode.Unathorized)
    })
    it("should be able to get api tokens", async () => {
      await request(__server__)
        .get(routes.apiTokens)
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(StatusCode.Ok)
    })
  })
  describe("DELETE /api-tokens", () => {
    let tokenId
    beforeAll(async () => {
      await request(__server__)
        .get(routes.apiTokens)
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(StatusCode.Ok)
        .then(({ body }) => {
          tokenId = body[0].id
        })
    })
    it("should not be able to delete api token as unauthorized user", async () => {
      await request(__server__)
        .delete(routes.apiTokens)
        .send()
        .expect(StatusCode.Unathorized)
    })
    it("should be able to delete api token", async () => {
      await request(__server__)
        .delete(routes.apiTokens)
        .set(__tokenHeaderKey__, credentials.token)
        .send({ id: tokenId })
        .expect(StatusCode.NoContent)
    })
    it("should return 400 when no token id provided", async () => {
      await request(__server__)
        .delete(routes.apiTokens)
        .set(__tokenHeaderKey__, credentials.token)
        .send({ id: null })
        .expect(StatusCode.BadRequest)
    })
  })
})
