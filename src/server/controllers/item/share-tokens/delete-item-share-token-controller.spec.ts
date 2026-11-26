import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { v4 as uuidv4 } from "uuid"
import { db } from "../../../../db/db"
import { deleteItemShareTokenController } from "./delete-item-share-token-controller"

jest.mock("../../../../db/db")


const mockResponse = () => {
    const res: Partial<Response> = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

describe("deleteItemShareTokenController", () => {
    it("should be able to delete only my token whe user role is operator", async () => {

        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/items"),
            "deleteMyShareToken")
        const request = {
            params: { projectName: "project", scenarioName: "scenario", itemId: "itemId", tokenId: "my-share-token" },
            user: { role: AllowedRoles.Operator, userId: uuidv4() },
        };
        (db.none as any).mockReturnValueOnce()

        await deleteItemShareTokenController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)

        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(querySpy)
            .toHaveBeenLastCalledWith(
                request.params.projectName,
                request.params.scenarioName,
                request.params.itemId,
                request.params.tokenId,
                request.user.userId)
        expect(response.send).toHaveBeenCalledTimes(1)
    })
    it("should be able to delete any token whe user role is admin", async () => {

        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/items"),
            "deleteShareToken")
        const request = {
            params: { projectName: "project", scenarioName: "scenario", itemId: "itemId", tokenId: "my-share-token" },
            user: { role: AllowedRoles.Admin, userId: uuidv4() },
        };
        (db.none as any).mockReturnValueOnce()

        await deleteItemShareTokenController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)

        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(querySpy)
            .toHaveBeenLastCalledWith(
                request.params.projectName,
                request.params.scenarioName,
                request.params.itemId,
                request.params.tokenId
            )
        expect(response.send).toHaveBeenCalledTimes(1)
    })

})
