const Joi = require('joi');
const projectName = Joi.string().required();
const environment = Joi.string().min(1).max(50).required();
const scenarioName = Joi.string().required();

export const labelParamSchema = {
  projectName,
  scenarioName,
  itemId: Joi.string().uuid().required(),
  label: Joi.string().required()
};

export const paramsSchema = Joi.object().keys({
  projectName,
  scenarioName,
  itemId: Joi.string().uuid().required()
});

export const labelQuerySchema = {
  environment: Joi.string().min(1).required(),
  virtualUsers: Joi.string()
};

export const updateItemBodySchema = Joi.object().keys({
  note: Joi.string().max(250).allow('').allow(null),
  base: Joi.boolean().required(),
  hostname: Joi.string().max(200),
  environment
});

export const newItemParamSchema = Joi.object().keys({
  projectName,
  scenarioName
});

