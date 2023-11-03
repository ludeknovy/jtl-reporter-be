import { IGetUserAuthInfoRequest } from "./request.model"
import { Response, NextFunction } from "express"
import { allowScenarioQueryTokenAuth } from "./allow-scenario-query-token-auth"

describe("allowScenarioQueryTokenAuth", () => {
    const nextFunction: NextFunction = jest.fn()
    const request: any = {}
    it("sets allowQueryAuthItem to true", async () => {
        await allowScenarioQueryTokenAuth(request as unknown as IGetUserAuthInfoRequest,
            {} as unknown as Response, nextFunction)
        expect(request.allowQueryAuthScenario).toEqual(true)
        expect(nextFunction).toHaveBeenCalledTimes(1)
    })

})
