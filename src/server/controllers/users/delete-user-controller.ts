import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteUser, isExistingUser } from "../../queries/users"
import { StatusCode } from "../../utils/status-code"

export const deleteUserController = async (req: Request, res: Response) => {
  const { userId } = req.params
  const [{ exists }] = await db.query(isExistingUser(userId))
  if (exists) {
    await db.query(deleteUser(userId))
    res.status(StatusCode.Ok).send()
  }
  res.status(StatusCode.NotFound).send()
}
