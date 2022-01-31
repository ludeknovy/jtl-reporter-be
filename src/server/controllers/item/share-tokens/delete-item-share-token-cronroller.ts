import { Response } from "express"
import { db } from "../../../../db/db"
import { AllowedRoles } from "../../../middleware/authorization-middleware"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { deleteMyShareToken, deleteShareToken } from "../../../queries/items"
import { StatusCode } from "../../../utils/status-code"

export const deleteItemShareTokenController = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const { user } = req
  const { projectName, scenarioName, itemId, tokenId } = req.params
  if ([AllowedRoles.Readonly, AllowedRoles.Operator].includes(user.role)) {
    await db.none(deleteMyShareToken(projectName, scenarioName, itemId, tokenId, user.userId))
    res.status(StatusCode.Ok).send()

  } else {
    await db.none(deleteShareToken(projectName, scenarioName, itemId, tokenId))
    res.status(StatusCode.Ok).send()
  }

}
