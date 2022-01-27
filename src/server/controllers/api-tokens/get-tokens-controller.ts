import { Response } from "express"
import { db } from "../../../db/db"
import { getApiToken, getOnlyMyApiTokens } from "../../queries/api-tokens"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import { StatusCode } from "../../utils/status-code"

export const getTokensController = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const { role, userId } = req.user
  if (role === AllowedRoles.Operator) {
    const myApiKeys = await db.any(getOnlyMyApiTokens(userId))
    return res.status(StatusCode.Ok).send(myApiKeys)
  }
  const result = await db.many(getApiToken)
  res.status(StatusCode.Ok).send(result)
}
