import { Request, Response, NextFunction } from "express"
import { db } from "../../../db/db"
import { getUsers } from "../../queries/auth"

export const getInitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await db.manyOrNone(getUsers())
    if (users && users.length > 0) {
      return res.status(200).send({ initialized: true })
    }
      return res.status(200).send({ initialized: false })

  } catch(error) {
    return next(error)
  }

}
