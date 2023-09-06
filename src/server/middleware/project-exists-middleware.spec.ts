import { IGetUserAuthInfoRequest } from "./request.model"
import { Response, NextFunction } from "express"
import { projectExistsMiddleware } from "./project-exists-middleware"
import { db } from "../../db/db"
import Boom = require("boom")

jest.mock("../../db/db")

describe("projectExistsMiddleware", () => {
    const nextFunction: NextFunction = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })
    it("should return 404 when no project found", async () => {
        const request: any = { params: { projectName: "does not exist" } }
        db.oneOrNone = jest.fn().mockReturnValueOnce(null)

        await projectExistsMiddleware(request as unknown as IGetUserAuthInfoRequest,
            {} as unknown as Response, nextFunction)
        expect(nextFunction).toHaveBeenCalledTimes(1)
        expect(nextFunction).toHaveBeenCalledWith(Boom.notFound("Project not found"))
    })

    it("should proceed when project found", async () => {
        const request: any = { params: { projectName: "my-project" } }
        db.oneOrNone = jest.fn().mockReturnValueOnce("projectId")

        await projectExistsMiddleware(request as unknown as IGetUserAuthInfoRequest,
            {} as unknown as Response, nextFunction)
        expect(nextFunction).toHaveBeenCalledTimes(1)
        expect(nextFunction).toHaveBeenCalledWith()
    })

})
