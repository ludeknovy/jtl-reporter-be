import * as Joi from "joi"

const USERNAME_MIN_LENGTH = 3
const PASSWORD_MIN_LENGTH = 8

const password = Joi.string().min(PASSWORD_MIN_LENGTH).required()

export const authQuerySchema = {
  username: Joi.string().min(USERNAME_MIN_LENGTH).required(),
  password: Joi.string().required(),
}

export const authWithTokenSchema = {
  token: Joi.string().required(),
}

export const changePasswordSchema = {
  currentPassword: Joi.string().required(),
  newPassword: password,
}
