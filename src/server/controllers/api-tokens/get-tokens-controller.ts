import { Response } from "express"
import { db } from "../../../db/db"
import { getApiTokens, getOnlyMyApiTokens } from "../../queries/api-tokens"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import { StatusCode } from "../../utils/status-code"

export const getTokensController = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const { role, userId } = req.user
  if (role === AllowedRoles.Operator) {
    const myApiKeys = await db.manyOrNone(getOnlyMyApiTokens(userId))
    return res.status(StatusCode.Ok).json(myApiKeys)
  }

  const result = await db.manyOrNone(getApiTokens())
  res.status(StatusCode.Ok).json(result)
}
