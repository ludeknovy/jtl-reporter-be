const Joi = require('joi');

export const newUserSchema = {
  username: Joi.string().min(3).regex(/^[0-9a-zA-Z.]+$/).required(),
  password: Joi.string().min(8).required(),
};
