import { Response, NextFunction } from "express"
import { db } from "../../../db/db"
import { isMyToken, deleteToken } from "../../queries/api-tokens"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import * as boom from "boom"
import { StatusCode } from "../../utils/status-code"

export const deleteTokenController = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const { id } = req.body
  const { userId, role } = req.user

  // regular user is allowed to detlete only its own api tokens
  if (role === AllowedRoles.Regular) {
    const { exists: isMine } = await db.one(isMyToken(id, userId))
    if (isMine) {
      await db.query(deleteToken(id))
      return res.status(StatusCode.NoContent).send()
    }
      return next(boom.forbidden())


  }
  await db.query(deleteToken(id))
  return res.status(StatusCode.NoContent).send()
}
