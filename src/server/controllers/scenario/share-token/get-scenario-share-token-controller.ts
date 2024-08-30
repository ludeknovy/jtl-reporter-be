import { Response } from "express"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { db } from "../../../../db/db"
import { StatusCode } from "../../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { searchScenarioShareTokens, selectOnlyMyScenarioShareTokens } from "../../../queries/scenario"

export const getScenarioShareTokenController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { role, userId } = req.user
    const { projectName, scenarioName } = req.params
    if ([AllowedRoles.Operator].includes(role)) {
        const myApiKeys = await db.manyOrNone(selectOnlyMyScenarioShareTokens(projectName, scenarioName, userId))
        res.status(StatusCode.Ok).json(myApiKeys)
    } else {
        const shareTokens = await db.manyOrNone(searchScenarioShareTokens(projectName, scenarioName))
        res.status(StatusCode.Ok).json(shareTokens)
    }

}
