import { Request, Response } from "express"
import { db } from "../../../db/db"
import { getApiTokens } from "../../queries/api-tokens"
import { StatusCode } from "../../utils/status-code"

export const getTokensController = async (req: Request, res: Response) => {
  const result = await db.many(getApiTokens())
  res.status(StatusCode.Ok).send(result)
}
