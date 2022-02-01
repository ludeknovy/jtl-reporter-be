import { AllowedRoles } from "../middleware/authorization-middleware"
import * as Joi from "joi"

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const username = Joi.string().min(3).regex(/^[0-9a-zA-Z.]+$/).required()
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const password = Joi.string().min(8).required()

export const newUserSchema = {
  username,
  password,
  role: Joi.string().valid(Object.values(AllowedRoles)).required(),
}

export const initUserScheam = {
  username,
  password,
}


export const userSchema = {
  userId: Joi.string().uuid().required(),
}
