// eslint-disable-next-line @typescript-eslint/naming-convention
const Joi = require('joi');

export const paramsSchema = {
  projectName: Joi.string().required(),
  scenarioName: Joi.string().required()
};

export const querySchema = {
  limit: Joi.number().integer().min(0).max(100),
  offset: Joi.number().integer()
};

export const scenarioUpdateSchema = {
  scenarioName: Joi.string().min(1).max(50).required()
};

export const scenarioNotificationBodySchema = {
  url: Joi.string().required(),
  type: Joi.string().valid('ms-teams').required(),
  name: Joi.string().min(1).max(100).required()
};
