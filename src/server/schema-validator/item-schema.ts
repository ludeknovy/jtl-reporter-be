const Joi = require('joi');
const projectName = Joi.string().required();
const environment = Joi.string().min(1).max(50).required();
const scenarioName = Joi.string().required();

export const paramsSchema = Joi.object().keys({
  projectName,
  scenarioName,
  itemId: Joi.string().uuid().required()
});

export const labelQuerySchema = {
  label: Joi.string().min(0).max(100),
  environment: Joi.string().min(1),
};

export const updateItemBodySchema = Joi.object().keys({
  note: Joi.string().max(250).allow('').allow(null),
  base: Joi.boolean().required(),
  environment
});

export const newItemParamSchema = Joi.object().keys({
  projectName,
  scenarioName
});

