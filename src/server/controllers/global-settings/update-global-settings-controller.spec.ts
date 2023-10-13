import { db } from "../../../db/db"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { Response } from "express"
import { updateGlobalSettingsController } from "./update-global-settings-controller"

jest.mock("../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}

describe("updateGlobalSettingsController", () => {
    it("should save the new settings into database", async () => {
        const response = mockResponse()
        const querySpy = jest.spyOn(require("../../queries/global-settings"), "updateGlobalSettings")
        const request = {
            user: {
                role: AllowedRoles.Admin,
            },
            body: {
                projectAutoProvisioning: true,
            },
        }
        db.none = jest.fn().mockResolvedValueOnce(null)

        await updateGlobalSettingsController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(querySpy).toHaveBeenCalledWith(true)
        expect(response.send).toHaveBeenCalledTimes(1)
    })
})
