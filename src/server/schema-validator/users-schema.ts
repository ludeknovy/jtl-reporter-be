import { AllowedRoles } from '../middleware/authorization-middleware';

const Joi = require('joi');

export const newUserSchema = {
  username: Joi.string().min(3).regex(/^[0-9a-zA-Z.]+$/).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(Object.values(AllowedRoles)).required()
};


export const userSchema = {
  userId: Joi.string().uuid().required()
};
