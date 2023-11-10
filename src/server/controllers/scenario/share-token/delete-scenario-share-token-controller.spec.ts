import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { v4 as uuidv4 } from "uuid"
import { deleteScenarioShareTokenController } from "./delete-scenario-share-token-controller"
import { db } from "../../../../db/db"

jest.mock("../../../../db/db")


const mockResponse = () => {
    const res: Partial<Response> = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

describe("deleteScenarioShareTokenController", () => {
    it("should be able to delete only my token whe user role is operator", async () => {

        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/scenario"),
            "deleteMyScenarioShareToken")
        const request = {
            params: { projectName: "project", scenarioName: "scenario", shareTokenId: "my-share-token" },
            user: { role: AllowedRoles.Operator, userId: uuidv4() },
        };
        (db.oneOrNone as any).mockReturnValueOnce({} ); // dummy token search response
        (db.none as any).mockReturnValueOnce()

        await deleteScenarioShareTokenController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)

        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(querySpy)
            .toHaveBeenLastCalledWith(
                request.params.projectName,
                request.params.scenarioName,
                request.params.shareTokenId,
                request.user.userId)
        expect(response.send).toHaveBeenCalledTimes(1)
    })
    it("should be able to delete any token whe user role is admin", async () => {

        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/scenario"),
            "deleteScenarioShareToken")
        const request = {
            params: { projectName: "project", scenarioName: "scenario", shareTokenId: "my-share-token" },
            user: { role: AllowedRoles.Admin, userId: uuidv4() },
        };
        (db.oneOrNone as any).mockReturnValueOnce({} ); // dummy token search response
        (db.none as any).mockReturnValueOnce()

        await deleteScenarioShareTokenController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)

        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(querySpy)
            .toHaveBeenLastCalledWith(
                request.params.projectName,
                request.params.scenarioName,
                request.params.shareTokenId
            )
        expect(response.send).toHaveBeenCalledTimes(1)
    })

})
