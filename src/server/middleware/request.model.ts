import { Request } from "express"
import { AllowedRoles } from "./authorization-middleware"

export interface IGetUserAuthInfoRequest extends Request<Record<string, string>> {
  user: {
    userId?: string
    role: AllowedRoles
  }
  allowQueryAuthItem?: boolean
  allowQueryAuthScenario?: boolean
}
