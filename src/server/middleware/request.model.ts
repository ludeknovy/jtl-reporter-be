import { Request } from "express"
export interface IGetUserAuthInfoRequest extends Request {
  user: { userId: string }
  allowQueryAuth?: boolean
}
