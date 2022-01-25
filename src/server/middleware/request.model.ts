import { Request } from "express"
import { AllowedRoles } from "./authorization-middleware"

export interface IGetUserAuthInfoRequest extends Request {
  user: {
    userId: string
    role: AllowedRoles
  }
  allowQueryAuth?: boolean
}
