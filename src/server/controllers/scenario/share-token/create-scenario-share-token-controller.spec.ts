import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { v4 as uuidv4 } from "uuid"
import { createScenarioShareTokenController } from "./create-scenario-share-token-controller"
import { StatusCode } from "../../../utils/status-code"
import { db } from "../../../../db/db"

jest.mock("../../../../db/db")

const mockResponse = () => {
    const res: Partial<Response> = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

describe("createScenarioShareTokenController", () => {
    it("should generate token and save it into db", async () => {
        const mockToken = "test-token-id"
        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../../queries/scenario"),
            "createScenarioShareToken")
        const tokenSpy = jest.spyOn(require("../../item/utils/generateShareToken"),
            "generateShareToken")
        tokenSpy.mockReturnValueOnce(mockToken);
        (db.none as any).mockReturnValueOnce()

        const request = {
            params: { projectName: "project", scenarioName: "scenario", shareTokenId: "my-share-token" },
            body: { note: "my-note" },
            user: { role: AllowedRoles.Operator, userId: uuidv4() },
        }

        await createScenarioShareTokenController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)

        expect(querySpy).toHaveBeenNthCalledWith(1,
            request.params.projectName,
            request.params.scenarioName,
            mockToken,
            request.user.userId,
            request.body.note)
        expect(response.status).toHaveBeenNthCalledWith(1, StatusCode.Created)
        expect(response.json).toHaveBeenNthCalledWith(1, { token: mockToken })
    })
})
