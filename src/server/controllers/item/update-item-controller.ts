import { Request, Response, NextFunction } from "express"
import { updateTestItemInfo, removeCurrentBaseFlag, setBaseFlag } from "../../queries/items"
import { db } from "../../../db/db"


export const updateItemController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params
  const { note, environment, hostname, base } = req.body
  try {
    await db.query("BEGIN")
    await db.none(updateTestItemInfo(itemId, scenarioName, projectName, note, environment, hostname))
    if (base) {
      await db.none(removeCurrentBaseFlag(scenarioName, projectName))
      await db.none(setBaseFlag(itemId, scenarioName, projectName))
    }
    await db.query("COMMIT")
    res.status(204).send()
  } catch(error) {
    await db.query("ROLLBACK")
    return next(error)
  }
}
