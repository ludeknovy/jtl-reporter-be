import { Response } from "express"
import { db } from "../../../db/db"
import { getScenarioEnvironmentController } from "./get-scenario-environment-controller"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { StatusCode } from "../../utils/status-code"

jest.mock("../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}


describe("getScenarioEnvironmentController", () => {
    it("should return environments", async function () {
        const projectName = "my-project"
        const scenarioName = "my-scenario"
        const querySpy = jest.spyOn(require("../../queries/scenario"), "searchEnvironments");

        (db.manyOrNone as any).mockResolvedValueOnce([{ environment: "environment-name" }])

        const response = mockResponse()
        const request = {
            params: {
                projectName,
                scenarioName,
            },
        }

        await getScenarioEnvironmentController(
            request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response
        )

        expect(response.json).toBeCalledWith(["environment-name"])
        expect(response.status).toBeCalledWith(StatusCode.Ok)
        expect(querySpy).toHaveBeenCalledWith(projectName, scenarioName)
    })

})
