import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteToken } from "../../queries/api-tokens"
import { StatusCode } from "../../utils/status-code"

export const deleteTokenController = async (req: Request, res: Response) => {
  const { id } = req.body
  await db.query(deleteToken(id))
  return res.status(StatusCode.NoContent).send()
}
