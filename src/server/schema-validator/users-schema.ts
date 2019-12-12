const Joi = require('joi');

export const newUserSchema = {
    username: Joi.string().min(3).regex(/[^a-zA-Z0-9]/).required(),
    password: Joi.string().required(),
  };