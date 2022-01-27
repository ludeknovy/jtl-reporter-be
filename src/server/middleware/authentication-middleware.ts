import { Response, NextFunction } from "express"
import * as boom from "boom"
import * as jwt from "jsonwebtoken"
import { db } from "../../db/db"
import { getUserById } from "../queries/auth"
import { getApiToken } from "../queries/api-tokens"
import { config } from "../config"
import { IGetUserAuthInfoRequest } from "./request.model"
import { logger } from "../../logger"
import { findShareToken } from "../queries/items"
import { AllowedRoles } from "./authorization-middleware"

const UNAUTHORIZED_MSG = "The token you provided is invalid"

// eslint-disable-next-line complexity
export const authenticationMiddleware = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {

  const { token } = req.query
  if (token && (token !== "undefined") && req.allowQueryAuth) {
    try {
      const { projectName, scenarioName, itemId } = req.params
      const shareToken = await db.oneOrNone(findShareToken(projectName, scenarioName, itemId, token))
      if (shareToken && shareToken.token) {
        // patch the role so it passes authorization middleware
        req.user = { role: AllowedRoles.Readonly }
        return next()
      }
      return next(boom.unauthorized(UNAUTHORIZED_MSG))
    } catch(error) {
      logger.error("Error while checking share link token " + error)
      return next(boom.internal())
    }
  }
  const accessToken = req.headers["x-access-token"]
  if (!accessToken) {
    return next(boom.unauthorized("Please provide x-access-token"))
  }
  if (isApiToken(accessToken)) {
    try {
      const [tokenData] = await db.query(getApiToken(accessToken))
      if (tokenData) {
        req.user = { userId: tokenData.created_by, role: tokenData.role }
        return next()
      }
      return next(boom.unauthorized(UNAUTHORIZED_MSG))

    } catch(error) {
      return next(boom.unauthorized(UNAUTHORIZED_MSG))
    }
  }

  try {
    const { userId } = await jwt.verify(accessToken, config.jwtToken)
    const [userData] = await db.query(getUserById(userId))
    if (!userData) {
      return next(boom.unauthorized(UNAUTHORIZED_MSG))
    }
    req.user = { userId, role: userData.role }
    next()
  } catch(error) {
    return next(boom.unauthorized(UNAUTHORIZED_MSG))
  }
}


const isApiToken = (token) => {
  return token.startsWith("at-")
}
