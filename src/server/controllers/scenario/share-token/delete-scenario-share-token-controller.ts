import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { db } from "../../../../db/db"
import { StatusCode } from "../../../utils/status-code"
import {
    deleteMyScenarioShareToken,
    deleteScenarioShareToken,
    findMyScenarioShareToken,
    findScenarioShareTokenById,
} from "../../../queries/scenario"
import { logger } from "../../../../logger"

export const deleteScenarioShareTokenController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { user } = req
    const { projectName, scenarioName, shareTokenId } = req.params
    if ([AllowedRoles.Operator].includes(user.role)) {
        const shareToken = await db.oneOrNone(
            findMyScenarioShareToken(projectName, scenarioName, shareTokenId, user.userId))
        if (shareToken) {
            await db.none(deleteMyScenarioShareToken(projectName, scenarioName, shareTokenId, user.userId))
            return res.status(StatusCode.Ok).send()
        }
        res.status(StatusCode.NotFound).send()
    } else {
        const shareToken = await db.oneOrNone(
            findScenarioShareTokenById(projectName, scenarioName, shareTokenId))
        if (shareToken) {
            await db.none(deleteScenarioShareToken(projectName, scenarioName, shareTokenId))
            return res.status(StatusCode.Ok).send()
        }
        logger.info(`Scenario token ${shareTokenId} not found. Cannot delete it.`)
        res.status(StatusCode.NotFound).send()

    }
}
