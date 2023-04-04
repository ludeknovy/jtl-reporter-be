import { Request, Response, NextFunction } from "express"
import {
    updateTestItemInfo,
    removeCurrentBaseFlag,
    setBaseFlag,
    getBaselineItemWithStats,
    findItemStats, saveThresholdsResult, findItemsWithThresholds
} from "../../queries/items"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"
import { scenarioThresholdsCalc } from "./utils/scenario-thresholds-calc"
import { getScenarioSettings } from "../../queries/scenario"
import { logger } from "../../../logger"


export const updateItemController = async (req: Request, res: Response, next: NextFunction) => {
    const { projectName, scenarioName, itemId } = req.params
    const { note, environment, hostname, base, name } = req.body
    try {
        await db.query("BEGIN")
        await db.none(updateTestItemInfo(itemId, scenarioName, projectName, note, environment, hostname, name))
        if (base) {
            await db.none(removeCurrentBaseFlag(scenarioName, projectName))
            await db.none(setBaseFlag(itemId, scenarioName, projectName))
            const scenarioSettings = await db.one(getScenarioSettings(projectName, scenarioName))
            if (scenarioSettings.thresholdEnabled) {
                logger.info("Thresholds enabled, searching for any connected reports")
                // items
                const itemsWithThresholds = await db.manyOrNone(findItemsWithThresholds(projectName, scenarioName))

                if (itemsWithThresholds && itemsWithThresholds.length > 0) {
                    logger.info("Items with thresholds that need to be updated found")
                    const { stats: newBaseLineReport } = await db.one(findItemStats(itemId))

                    // eslint-disable-next-line max-depth
                    for (const itemIdToBeRecalculated of itemsWithThresholds) {
                        logger.info(`About to re-calculate threshold for item: ${itemIdToBeRecalculated.id}`)

                        const { stats: statsToBeRecalculatedItem } = await db.one(
                            findItemStats(itemIdToBeRecalculated.id))

                        const updatedThreshold = scenarioThresholdsCalc(statsToBeRecalculatedItem,
                            newBaseLineReport, scenarioSettings)
                        // eslint-disable-next-line max-depth
                        if (updatedThreshold) {
                            // eslint-disable-next-line max-len
                            logger.info(`About to save re-calculated threshold values for item: ${itemIdToBeRecalculated.id}`)
                            await db.none(saveThresholdsResult(projectName, scenarioName,
                                itemIdToBeRecalculated.id, updatedThreshold))
                        }
                    }
                }
            }

        }
        await db.query("COMMIT")
        res.status(StatusCode.NoContent).send()
    } catch(error) {
        await db.query("ROLLBACK")
        return next(error)
    }
}
