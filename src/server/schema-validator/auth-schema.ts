const Joi = require('joi');

const password = Joi.string().min(8).required()

export const authQuerySchema = {
  username: Joi.string().min(3).required(),
  password
};

export const changePasswordSchema = {
  currentPassword: Joi.string().required(),
  newPassword: password
}