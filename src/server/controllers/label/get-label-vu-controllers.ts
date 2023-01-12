import { Request, Response, NextFunction } from "express"
import { getMaxVuForLabel } from "../../queries/items"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"

export const getLabelVirtualUsersController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId, label } = req.params
  const { environment } = req.query
  try {
    const result = await db.query(getMaxVuForLabel(
      scenarioName, projectName, label,
      itemId, environment))
    res.status(StatusCode.Ok).json({ result })
  } catch(error) {
    return next(error)
  }
}
