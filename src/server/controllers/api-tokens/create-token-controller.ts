import { Response, NextFunction } from "express"
import { db } from "../../../db/db"
import * as uuid from "uuid"
import { createNewApiToken } from "../../queries/api-tokens"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { StatusCode } from "../../utils/status-code"

export const createTokenController = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const { description } = req.body
  const { userId } = req.user
  const newToken = `at-${uuid()}`
  try {
    await db.query(createNewApiToken(newToken, description, userId))
    return res.status(StatusCode.Created).send({ token: newToken })
  } catch(error) {
    return next(error)
  }
}
