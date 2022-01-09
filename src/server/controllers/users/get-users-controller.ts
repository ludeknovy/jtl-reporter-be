import { Request, Response } from "express"
import { db } from "../../../db/db"
import { getUsers } from "../../queries/users"
import { StatusCode } from "../../utils/status-code"


export const getUsersController = async (req: Request, res: Response) => {
  const result = await db.query(getUsers)
  res.status(StatusCode.Ok).send(result)
}
