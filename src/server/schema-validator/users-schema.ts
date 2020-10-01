// eslint-disable-next-line @typescript-eslint/naming-convention
const Joi = require('joi');

export const newUserSchema = {
  username: Joi.string().min(3).regex(/^[0-9a-zA-Z.]+$/).required(),
  password: Joi.string().min(8).required()
};


export const userSchema = {
  userId: Joi.string().uuid().required()
};
