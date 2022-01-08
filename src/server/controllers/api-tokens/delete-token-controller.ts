import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteToken } from "../../queries/api-tokens"
import { StatusCodes } from "../../utils/status-codes"

export const deleteTokenController = async (req: Request, res: Response) => {
  const { id } = req.body
  await db.query(deleteToken(id))
  return res.status(StatusCodes.NoContent).send()
}
