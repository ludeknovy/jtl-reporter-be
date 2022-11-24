import { NextFunction } from "express"
import { AllowedRoles, authorizationMiddleware } from "./authorization-middleware"
import * as boom from "boom"
import { db } from "../../db/db"
jest.mock("../../db/db")

describe("AuthorizationMiddleware", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })
    it("should return forbidden when role is not allowed", () => {
        const nextFunction: NextFunction = jest.fn()
        const mockResponse: Partial<Response> = {}

        const req = {
            user: {
                role: AllowedRoles.Readonly,
            },
            params: { },
        }
        authorizationMiddleware([AllowedRoles.Operator])(req, mockResponse, nextFunction)
        expect(nextFunction).toBeCalledWith(boom.forbidden(`Not enough permission to do this`))
    })

    it("should call next when role is allowed", () => {
        const nextFunction: NextFunction = jest.fn()
        const mockResponse: Partial<Response> = {}

        const req = {
            user: {
                role: AllowedRoles.Readonly,
            },
            params: { },

        }
        authorizationMiddleware([AllowedRoles.Readonly])(req, mockResponse, nextFunction)
        expect(nextFunction).toBeCalledTimes(1)
        expect(nextFunction).toBeCalledWith()
    })
    it("should check if user has access when project related resource accessed", function () {
        const nextFunction: NextFunction = jest.fn()
        const mockResponse: Partial<Response> = {}

        const req = {
            user: {
                role: AllowedRoles.Readonly,
                userId: "123",
            },
            params: {
                projectName: "projectName",
            },
        }
        const querySpy = jest.spyOn(require("../queries/user-project-access"), "isUserAuthorizedForProject");
        (db.oneOrNone as any).mockResolvedValue({ userId: "123 " })

        authorizationMiddleware([AllowedRoles.Readonly])(req, mockResponse, nextFunction)
        expect(querySpy).toHaveBeenNthCalledWith(1, "projectName", "123")
        expect(nextFunction).not.toBeCalledWith(boom.forbidden(`You dont have permission to access`))
    })
    it.skip("should return forbidden error if user has no access to project related resource", () => {
        const nextFunction: NextFunction = jest.fn()
        const mockResponse: Partial<Response> = {}

        const req = {
            user: {
                role: AllowedRoles.Readonly,
                userId: "123",
            },
            params: {
                projectName: "projectName",
            },
        }
        const querySpy = jest.spyOn(require("../queries/user-project-access"), "isUserAuthorizedForProject");
        (db.oneOrNone as any).mockResolvedValueOnce(null)

        authorizationMiddleware([AllowedRoles.Readonly])(req, mockResponse, nextFunction)
        expect(querySpy).toHaveBeenNthCalledWith(1, "projectName", "123")
        expect(nextFunction).toHaveBeenCalledWith(boom.forbidden(`You dont have permission to access`))
    })
})
