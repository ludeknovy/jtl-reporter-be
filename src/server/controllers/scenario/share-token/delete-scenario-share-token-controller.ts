import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { db } from "../../../../db/db"
import { StatusCode } from "../../../utils/status-code"
import { deleteMyScenarioShareToken, deleteScenarioShareToken } from "../../../queries/scenario"

export const deleteScenarioShareTokenController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { user } = req
    const { projectName, scenarioName, shareTokenId } = req.params
    if ([AllowedRoles.Readonly, AllowedRoles.Operator].includes(user.role)) {
        await db.none(deleteMyScenarioShareToken(projectName, scenarioName, shareTokenId, user.userId))
        res.status(StatusCode.Ok).send()

    } else {
        await db.none(deleteScenarioShareToken(projectName, scenarioName, shareTokenId))
        res.status(StatusCode.Ok).send()
    }
}
