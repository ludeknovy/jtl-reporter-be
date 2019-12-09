const Joi = require('joi');

export const newTokenSchema = {
  description: Joi.string().required()
}

export const deleteTokenSchema = {
  id: Joi.string().uuid().required()
}