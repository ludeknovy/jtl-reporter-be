import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteScenario } from "../../queries/scenario"

export const deleteScenarioController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  await db.none(deleteScenario(projectName, scenarioName))
  res.status(204).send()
}
