import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { getScenarioShareTokenController } from "./get-scenario-share-token-controller"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { v4 as uuidv4 } from "uuid"
import { db } from "../../../../db/db"

jest.mock("../../../../db/db")

const mockResponse = () => {
    const res: Partial<Response> = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

describe("getScenarioShareTokenController", () => {
    it("should load only my keys when user role is operator", async () => {
        const mockData = [{ id: "1", note: "my note", token: "my token" }]
        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/scenario"), "selectOnlyMyScenarioShareTokens")
        const request = {
            params: { projectName: "project", scenarioName: "scenario" },
            user: { role: AllowedRoles.Operator, userId: uuidv4() },
        };
        (db.manyOrNone as any).mockResolvedValueOnce(mockData)
        await getScenarioShareTokenController(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(querySpy)
            .toHaveBeenLastCalledWith(request.params.projectName, request.params.scenarioName, request.user.userId)
        expect(response.status).toHaveBeenCalledTimes(1)
        expect(response.json).toHaveBeenNthCalledWith(1, mockData)
    })
    it("should return all tokens when user role is admin", async () => {
        const mockData = [
            { id: "1", note: "my note", token: "my token" },
            { id: "2", note: "my note", token: "my token 2" },
        ]
        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/scenario"), "searchScenarioShareTokens")
        const request = {
            params: { projectName: "project", scenarioName: "scenario" },
            user: { role: AllowedRoles.Admin, userId: uuidv4() },
        };
        (db.manyOrNone as any).mockResolvedValueOnce(mockData)
        await getScenarioShareTokenController(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(querySpy)
            .toHaveBeenLastCalledWith(request.params.projectName, request.params.scenarioName)
        expect(response.status).toHaveBeenCalledTimes(1)
        expect(response.json).toHaveBeenNthCalledWith(1, mockData)
    })
})
