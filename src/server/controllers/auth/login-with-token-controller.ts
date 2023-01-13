import boom = require("boom")
import { Request, Response, NextFunction } from "express"
import { db } from "../../../db/db"
import { logger } from "../../../logger"
import { getApiToken } from "../../queries/api-tokens"
import { generateTokenFromToken } from "./helper/token-generator"
import { StatusCode } from "../../utils/status-code"

export const loginWithTokenController = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body
  try {
    const [tokenData] = await db.query(getApiToken(token))
    const { created_by } = tokenData
    const jwtToken = generateTokenFromToken(created_by)
    return res.status(StatusCode.Ok).json({ jwtToken })
  } catch(error) {
    logger.error(error)
    return next(boom.unauthorized())
  }
}
