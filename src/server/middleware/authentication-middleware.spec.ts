import { Response, NextFunction } from "express"
import { IGetUserAuthInfoRequest } from "./request.model"
import Boom = require("boom")
import { db } from "../../db/db"
import * as jwt from "jsonwebtoken"
import { authenticationMiddleware } from "./authentication-middleware"
import { AllowedRoles } from "./authorization-middleware"

jest.mock("../../db/db")
jest.mock("jsonwebtoken")

describe("AuthenticationMiddleware", () => {
  const nextFunction: NextFunction = jest.fn()
  const mockResponse: Partial<Response> = {}

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("should return 401 when no x-access-token header provided", async () => {

    await authenticationMiddleware({ headers: {}, query: {} } as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
    expect(nextFunction).toHaveBeenCalledWith(Boom.unauthorized("Please provide x-access-token"))
  })

  describe("Query token", () => {
    it("should return unauthorized when invalid query token provided", async () => {
      await authenticationMiddleware({
        headers: {},
        query: { token: "123" },
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
        allowQueryAuth: true,
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith(Boom.unauthorized("The token you provided is invalid"))
    })
    it("should proceed when valid token provided", async () => {
      db.oneOrNone = jest.fn().mockResolvedValue({ token: "test" })
      await authenticationMiddleware({
        headers: {},
        query: { token: "123" },
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
        allowQueryAuth: true,
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith()
    })
    it("should return internal server error when something goes wrong", async () => {
      db.oneOrNone = jest.fn().mockRejectedValue(new Error())
      await authenticationMiddleware({
        headers: {},
        query: { token: "123" },
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
        allowQueryAuth: true,
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith(Boom.internal())
    })
    it("should add role to the user object", async () => {
      db.oneOrNone = jest.fn().mockResolvedValue({ token: "test" })
      const req = {
        headers: {},
        query: { token: "123" },
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
        allowQueryAuth: true,
        user: null,
      }
      await authenticationMiddleware(req as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(req.user).toEqual({ role:AllowedRoles.Readonly })
      expect(nextFunction).toHaveBeenCalledWith()
    })
  })
  describe("Api token", () => {
    it("should proceed when valid token provided", async () => {
      db.query = jest.fn().mockResolvedValueOnce([{ created_by: "user" }])
      await authenticationMiddleware({
        headers: { "x-access-token": "at-test" },
        query: {},
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith()
    })
    it("should return unathorized when invalid token provided", async () => {
      db.query = jest.fn().mockResolvedValueOnce([])
      await authenticationMiddleware({
        headers: { "x-access-token": "at-test" },
        query: {},
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith(Boom.unauthorized("The token you provided is invalid"))
    })
    it("should return unathorized when error something goes wrong", async() => {
      db.query = jest.fn().mockRejectedValue(new Error())
      await authenticationMiddleware({
        headers: { "x-access-token": "at-test" },
        query: {},
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith(Boom.unauthorized("The token you provided is invalid"))
    })
    it("should add role to the user object", async () => {
      db.query = jest.fn().mockResolvedValue([{ created_by: "test-user-id", role: AllowedRoles.Operator }])
      const req = {
        headers: { "x-access-token": "at-test" },
        query: { },
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
        user: null,
      }
      await authenticationMiddleware(req as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(req.user).toEqual({ role:AllowedRoles.Operator, userId: "test-user-id" })
      expect(nextFunction).toHaveBeenCalledWith()
    })
  })
  describe("JWT token", () => {
    it("should proceed when valid JWT token provided", async() => {
      db.query = jest.fn().mockResolvedValueOnce([{}])
      jwt.verify = jest.fn().mockResolvedValueOnce({ userId: 1 })

      await authenticationMiddleware({
        headers: { "x-access-token": "test" },
        query: {},
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
        allowQueryAuth: true,
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith()
    })
    it("should return unathorized when invalid token provided", async () => {
      jwt.verify = jest.fn().mockRejectedValueOnce(new Error())

      await authenticationMiddleware({
        headers: { "x-access-token": "test" },
        query: {},
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
        allowQueryAuth: true,
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith(Boom.unauthorized("The token you provided is invalid"))
    })
    it("should return unathorized when user not found in db", async () => {
      jwt.verify = jest.fn().mockResolvedValueOnce({ userId: 1 })
      db.query = jest.fn().mockResolvedValueOnce([])

      await authenticationMiddleware({
        headers: { "x-access-token": "test" },
        query: {},
        params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
        allowQueryAuth: true,
      } as unknown as IGetUserAuthInfoRequest,
      mockResponse as Response, nextFunction)
      expect(nextFunction).toHaveBeenCalledWith(Boom.unauthorized("The token you provided is invalid"))
    })
  })
})
