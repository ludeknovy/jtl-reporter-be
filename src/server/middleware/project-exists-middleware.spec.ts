import { IGetUserAuthInfoRequest } from "./request.model"
import { Response, NextFunction } from "express"
import {projectAutoProvisioningMiddleware, projectExistsMiddleware} from "./project-exists-middleware"
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


describe("projectAutoProvisioningMiddleware", () => {
    const nextFunction: NextFunction = jest.fn()


    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("should create new project when it does not exists and auto provisioning is enabled in global settings",
        async () => {
            const request: any = { params: { projectName: "does not exist" } }
            db.oneOrNone = jest.fn().mockReturnValueOnce(null)
            db.one = jest.fn().mockReturnValueOnce({ project_auto_provisioning: true })
            const spy = jest.spyOn(require("../queries/projects"), "createNewProject")
            await projectAutoProvisioningMiddleware(request as unknown as IGetUserAuthInfoRequest,
                {} as unknown as Response, nextFunction)
            expect(nextFunction).toHaveBeenCalledTimes(1)
            expect(nextFunction).toHaveBeenCalledWith()
            expect(spy).toHaveBeenCalledWith("does not exist", true)
        })


    it("should continue when project exists",
        async () => {
            const request: any = { params: { projectName: "does not exist" } }
            db.oneOrNone = jest.fn().mockReturnValueOnce("project data")
            const spy = jest.spyOn(require("../queries/global-settings"), "getGlobalSettings")
            await projectAutoProvisioningMiddleware(request as unknown as IGetUserAuthInfoRequest,
                {} as unknown as Response, nextFunction)
            expect(nextFunction).toHaveBeenCalledTimes(1)
            expect(nextFunction).toHaveBeenCalledWith()
            expect(spy).toHaveBeenCalledTimes(0)
        })

    it("should return 404 when project does not exists and auto provisioning is disabled in global settings",
        async () => {
            const request: any = { params: { projectName: "does not exist" } }
            db.oneOrNone = jest.fn().mockReturnValueOnce(null)
            db.one = jest.fn().mockReturnValueOnce({ project_auto_provisioning: false })
            const spy = jest.spyOn(require("../queries/projects"), "createNewProject")
            await projectAutoProvisioningMiddleware(request as unknown as IGetUserAuthInfoRequest,
                {} as unknown as Response, nextFunction)
            expect(nextFunction).toHaveBeenCalledTimes(1)
            expect(nextFunction).toHaveBeenCalledWith(Boom.notFound("Project not found"))
            expect(spy).toHaveBeenCalledTimes(0)
        })

})
