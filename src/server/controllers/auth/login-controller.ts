import { Request, Response, NextFunction } from "express"
import { db } from "../../../db/db"
import { getUser } from "../../queries/auth"
import * as boom from "boom"
import { passwordMatch } from "./helper/passwords"
import { generateToken } from "./helper/token-generator"
import { StatusCode } from "../../utils/status-code"


export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body
  try {
    const result = await db.query(getUser(username))
    if (!result[0]) {
      return next(boom.unauthorized("Invalid credentials"))
    }
    if (!await passwordMatch(password, result[0].password)) {
      return next(boom.unauthorized("Invalid credentials"))
    }
    const token = generateToken(result[0].id)
    return res.status(StatusCode.Ok).json({ token, username, role: result[0].role })
  } catch(error) {
    return next(error)
  }

}
