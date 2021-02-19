// eslint-disable-next-line @typescript-eslint/naming-convention
const Joi = require('joi');
const projectName = Joi.string().required();
const environment = Joi.string().min(1).max(50).required();
const scenarioName = Joi.string().required();
const hostname = Joi.string().max(200).allow('').allow(null);
const note = Joi.string().max(250).allow('').allow(null);
const itemId = Joi.string().uuid().required();

export const labelParamSchema = {
  projectName,
  scenarioName,
  itemId,
  label: Joi.string().required()
};

export const shareTokenSchema = Joi.object().keys({
  projectName,
  scenarioName,
  itemId,
  tokenId: Joi.string().uuid().required()
});

export const paramsSchema = Joi.object().keys({
  projectName,
  scenarioName,
  itemId
});

export const labelQuerySchema = {
  environment: Joi.string().min(1).required(),
  virtualUsers: Joi.string()
};

export const updateItemBodySchema = Joi.object().keys({
  note,
  base: Joi.boolean().required(),
  hostname,
  environment
});

export const newAsyncItemStartBodySchema = Joi.object().keys({
  environment,
  hostname,
  note
});

export const stopAsyncItemBody = Joi.object().keys({
  itemId
});

export const newItemParamSchema = Joi.object().keys({
  projectName,
  scenarioName
});

