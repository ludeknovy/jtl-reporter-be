import { getGlobalSettingsController } from "./get-global-settings-controller"
import { Response } from "express"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { db } from "../../../db/db"

jest.mock("../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}
describe("getGlobalSettingsController", () => {
    it("should return global settings", async () => {
        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../queries/global-settings"), "getGlobalSettings")
        const request = {
            user: {
                role: AllowedRoles.Admin,
            },
        }
        db.one = jest.fn().mockReturnValueOnce({ project_auto_provisioning: true })
        await getGlobalSettingsController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(response.json).toHaveBeenCalledTimes(1)
        expect(response.json).toHaveBeenCalledWith({ projectAutoProvisioning: true })
    })
})
