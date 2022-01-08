import { Request, Response } from "express"
import { db } from "../../../db/db"
import { getUsers } from "../../queries/users"


export const getUsersController = async (req: Request, res: Response) => {
  const result = await db.query(getUsers)
  res.status(200).send(result)
}
