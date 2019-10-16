const Joi = require('joi');

export const testDataSchema = {
  consumer: Joi.string().required(),
  state: Joi.string().required()
};
