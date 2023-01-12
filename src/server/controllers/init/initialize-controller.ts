import { Request, Response, NextFunction } from "express"
import { db } from "../../../db/db"
import { getUsers } from "../../queries/auth"
import { StatusCode } from "../../utils/status-code"

export const getInitController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await db.manyOrNone(getUsers())
        if (users && users.length > 0) {
            return res.status(StatusCode.Ok).json({ initialized: true })
        }
        return res.status(StatusCode.Ok).json({ initialized: false })

    } catch(error) {
        return next(error)
    }

}
