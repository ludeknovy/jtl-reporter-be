import { Response } from "express"
import { db } from "../../../../db/db"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { selectOnlyMyShareTokens, selectShareTokens } from "../../../queries/items"
import { StatusCode } from "../../../utils/status-code"

export const getItemLinksController = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const { role, userId } = req.user
  const { projectName, scenarioName, itemId } = req.params
  if ([AllowedRoles.Readonly, AllowedRoles.Operator].includes(role)) {
    const myApiKeys = await db.manyOrNone(selectOnlyMyShareTokens(projectName, scenarioName, itemId, userId))
    return res.send(StatusCode.Ok).json(myApiKeys)
  }
    const shareTokens = await db.manyOrNone(selectShareTokens(projectName, scenarioName, itemId))
    res.status(StatusCode.Ok).json(shareTokens)

}
