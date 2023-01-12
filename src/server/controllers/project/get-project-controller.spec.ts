import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getProjectController } from "./get-project-controller"
import { db } from "../../../db/db"

jest.mock("../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}


describe("getProjectController", () => {
    it("should return project settings", async function () {
        const responseStub = { name: "project" }
        const response = mockResponse()
        const request = {
            params: {
                projectName: "project",
            },
            user: {
                role: "admin",
            },
        };
        (db.one as any).mockResolvedValue(responseStub);
        (db.manyOrNone as any).mockResolvedValue([{ user_id: 1 }])
        await getProjectController(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(response.json).toHaveBeenCalledTimes(1)
        expect(response.json).toBeCalledWith({ ...responseStub, projectMembers: [1] })
    })
    it("should not return project members when user role is not admin", async () => {
        const responseStub = { name: "project" }
        const response = mockResponse()
        const request = {
            params: {
                projectName: "project",
            },
            user: {
                role: "operator",
            },
        };
        (db.one as any).mockResolvedValue(responseStub)
        await getProjectController(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(response.json).toHaveBeenCalledTimes(1)
        expect(response.json).toBeCalledWith({ ...responseStub, projectMembers: [] })
    })
})
