import { Response } from "express"
import { getLatestItemsControllers } from "./get-latest-items-controllers"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { db } from "../../../db/db"

jest.mock("../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}


describe("getLatestItemsController", function () {
    it("should return latest items for given user", async function () {
        const response = mockResponse()

        const request = {
            user: {
                userId: 123,
            },
        };
        (db.many as any).mockResolvedValueOnce([])

        const latestItemSpy = jest.spyOn(require("../../queries/projects"), "latestItems")
        await getLatestItemsControllers(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(latestItemSpy).toHaveBeenNthCalledWith(1, request.user.userId)

        expect(response.send).toHaveBeenCalledWith([])
    })
})
