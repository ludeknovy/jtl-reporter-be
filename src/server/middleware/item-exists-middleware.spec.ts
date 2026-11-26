import { IGetUserAuthInfoRequest } from "./request.model"
import { Response, NextFunction } from "express"
import { itemExistsMiddleware } from "./item-exists-middleware"
import { db } from "../../db/db"
import Boom = require("@hapi/boom")

jest.mock("../../db/db")

describe("itemExistsMiddleware", () => {
    const nextFunction: NextFunction = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("should return 404 when item is not found in project and scenario", async () => {
        const request: any = {
            params: { projectName: "my-project", scenarioName: "my-scenario", itemId: "item-1" },
        }
        db.oneOrNone = jest.fn().mockReturnValueOnce(null)

        await itemExistsMiddleware(
            request as unknown as IGetUserAuthInfoRequest,
            {} as unknown as Response,
            nextFunction
        )
        expect(nextFunction).toHaveBeenCalledTimes(1)
        expect(nextFunction).toHaveBeenCalledWith(Boom.notFound("Item not found"))
    })

    it("should proceed when item belongs to project and scenario", async () => {
        const request: any = {
            params: { projectName: "my-project", scenarioName: "my-scenario", itemId: "item-1" },
        }
        db.oneOrNone = jest.fn().mockReturnValueOnce({ id: "item-1" })

        await itemExistsMiddleware(
            request as unknown as IGetUserAuthInfoRequest,
            {} as unknown as Response,
            nextFunction
        )
        expect(nextFunction).toHaveBeenCalledTimes(1)
        expect(nextFunction).toHaveBeenCalledWith()
    })
})
