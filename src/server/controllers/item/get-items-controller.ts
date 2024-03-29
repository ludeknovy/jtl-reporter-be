import { Request, Response } from "express"

import { itemsForScenarioCount, findItemsForScenario } from "../../queries/scenario"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"

const LIMIT = 15

export const getItemsController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const { limit = LIMIT, offset = 0, environment } = req.query
  const nullableEnv = environment === "" ? null : environment
  const { total } = await db.one(itemsForScenarioCount(projectName, scenarioName, nullableEnv))
  const ids = await db.any(findItemsForScenario(projectName, scenarioName, nullableEnv, limit, offset))
  const idsBaseUpdate = ids.map(_ => {
    _.base = !_.base ? false : true
    return _
  })
  res.status(StatusCode.Ok).json({ name: scenarioName, data: idsBaseUpdate, total: parseInt(total, 10) })
}
