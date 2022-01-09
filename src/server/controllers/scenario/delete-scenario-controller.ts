import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteScenario } from "../../queries/scenario"
import { StatusCode } from "../../utils/status-code"

export const deleteScenarioController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  await db.none(deleteScenario(projectName, scenarioName))
  res.status(StatusCode.NoContent).send()
}
