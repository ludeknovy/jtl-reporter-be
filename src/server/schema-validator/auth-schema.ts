import * as Joi from "joi"

const password = Joi.string().min(8).required()

export const authQuerySchema = {
  username: Joi.string().min(3).required(),
  password: Joi.string().required(),
}

export const authWithTokenSchema = {
  token: Joi.string().required(),
}

export const changePasswordSchema = {
  currentPassword: Joi.string().required(),
  newPassword: password,
}
