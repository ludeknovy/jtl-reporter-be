import { getItemLinksController } from "./get-item-share-tokens-controller"
import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { db } from "../../../../db/db"
import { StatusCode } from "../../../utils/status-code"

jest.mock("../../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    return res
}

describe("getItemLinksController", () => {
    it("should only my tokens when user role is operator", async () => {
        const tokenData = [{ id: "1", token: "tokenId", name: "test token" }]

        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/items"), "selectOnlyMyShareTokens")
        const request = {
            params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
            user: { userId: "userId", role: AllowedRoles.Operator },
        };
        (db.manyOrNone as any).mockResolvedValueOnce(tokenData)
        await getItemLinksController(request as unknown as IGetUserAuthInfoRequest, response as unknown as Response)
        expect(querySpy).toHaveBeenNthCalledWith(1,
            request.params.projectName,
            request.params.scenarioName,
            request.params.itemId,
            request.user.userId
        )
        expect(response.send).toHaveBeenNthCalledWith(1, StatusCode.Ok)
        expect(response.json).toHaveBeenNthCalledWith(1, tokenData)
    })

    it("should return all tokens when user role is admin", async () => {
        const tokenData = [{ id: "1", token: "tokenId", name: "test token" }]
        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/items"), "selectShareTokens")
        const request = {
            params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
            user: { userId: "userId", role: AllowedRoles.Admin },
        };
        (db.manyOrNone as any).mockResolvedValueOnce(tokenData)
        await getItemLinksController(request as unknown as IGetUserAuthInfoRequest, response as unknown as Response)
        expect(querySpy).toHaveBeenNthCalledWith(1,
            request.params.projectName,
            request.params.scenarioName,
            request.params.itemId
        )
        expect(response.json).toHaveBeenNthCalledWith(1, tokenData)
        expect(response.status).toHaveBeenNthCalledWith(1, StatusCode.Ok)
    })
})
