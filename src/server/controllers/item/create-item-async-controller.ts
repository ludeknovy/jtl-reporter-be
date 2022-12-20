import { Response } from "express"
import { db } from "../../../db/db"
import { logger } from "../../../logger"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { createNewItem, createShareToken } from "../../queries/items"
import { ItemStatus, ReportStatus } from "../../queries/items.model"
import { scenarioGenerateToken } from "../../queries/scenario"
import { StatusCode } from "../../utils/status-code"
import { generateShareToken } from "./utils/generateShareToken"
import { upsertScenario } from "./shared/upsert-scenario"

export const createItemAsyncController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { environment, note, status = ItemStatus.None, hostname, name } = req.body
    const { scenarioName, projectName } = req.params

    logger.info(`Creating new item for scenario: ${scenarioName}`)
    try {
        await upsertScenario(projectName, scenarioName)

        const item = await db.one(createNewItem(
            scenarioName,
            null,
            environment,
            note,
            status,
            projectName,
            hostname,
            ReportStatus.InProgress,
            name
        ))

        const { generate_share_token: shouldGenerateToken } = await db.one(
            scenarioGenerateToken(projectName, scenarioName))
        let shareToken
        if (shouldGenerateToken) {
            shareToken = generateShareToken()
            await db.none(createShareToken(projectName, scenarioName, item.id,
                shareToken, req.user.userId, "automatically generated token"))
        }

        const itemId = item.id
        logger.info(`New item for scenario: ${scenarioName} created with id: ${itemId}`)
        res.status(StatusCode.Created).send({ itemId, shareToken })
    } catch(e) {
        logger.error(`Creating new async item failed ${e}`)
        res.status(StatusCode.InternalError).send()
    }
}
