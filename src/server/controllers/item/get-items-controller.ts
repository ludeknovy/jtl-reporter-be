import { Request, Response } from "express"

import { itemsForScenarioCount, findItemsForScenario } from "../../queries/scenario"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"

export const getItemsController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const { limit = 15, offset = 0 } = req.query
  const { total } = await db.one(itemsForScenarioCount(projectName, scenarioName))
  const ids = await db.any(findItemsForScenario(projectName, scenarioName, limit, offset))
  const idsBaseUpdate = ids.map(_ => {
    _.base = !_.base ? false : true
    return _
  })
  res.status(StatusCode.Ok).send({ name: scenarioName, data: idsBaseUpdate, total: parseInt(total, 10) })
}
