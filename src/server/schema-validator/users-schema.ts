import { AllowedRoles } from "../middleware/authorization-middleware"
import * as Joi from "joi"

export const newUserSchema = {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  username: Joi.string().min(3).regex(/^[0-9a-zA-Z.]+$/).required(),
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(Object.values(AllowedRoles)).required(),
}


export const userSchema = {
  userId: Joi.string().uuid().required(),
}
