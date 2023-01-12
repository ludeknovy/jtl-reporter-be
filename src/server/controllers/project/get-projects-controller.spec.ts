import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { db } from "../../../db/db"
import { getProjectsController } from "./get-projects-controller"

jest.mock("../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}


describe("getProjectsController", function () {
    it("should return projects for given user", async function () {
        const response = mockResponse()

        const request = {
            user: {
                userId: 123,
            },
        }

        const projects = [{ projectName: "test", id: "123" }];
        (db.any as any).mockResolvedValueOnce(projects)

        const findProjectsSpy = jest.spyOn(require("../../queries/projects"), "findProjects")
        await getProjectsController(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(findProjectsSpy).toHaveBeenNthCalledWith(1, request.user.userId)

        expect(response.json).toHaveBeenCalledWith(projects)
    })
})
