import { NextFunction } from "express"
import { AllowedRoles, authorizationMiddleware } from "./authorization-middleware"
import * as boom from "boom"


describe("AuthorizationMiddleware", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })
    it("should return forbidden when role is not allowed", () => {
        const nextFunction: NextFunction = jest.fn()
        const mockResponse: Partial<Response> = {}

        const req = { user: {
            role: AllowedRoles.Readonly,
        } }
        authorizationMiddleware([AllowedRoles.Operator])(req, mockResponse, nextFunction)
        expect(nextFunction).toBeCalledWith(boom.forbidden(`Not enough permission to do this`))
    })

    it("should call next when role is allowed", () => {
        const nextFunction: NextFunction = jest.fn()
        const mockResponse: Partial<Response> = {}

        const req = { user: {
            role: AllowedRoles.Readonly,
        } }
        authorizationMiddleware([AllowedRoles.Readonly])(req, mockResponse, nextFunction)
        expect(nextFunction).toBeCalledTimes(1)
        expect(nextFunction).toBeCalledWith()
    })
})
