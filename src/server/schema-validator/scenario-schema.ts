import { scenarioSchema } from './project-schema';

// eslint-disable-next-line @typescript-eslint/naming-convention
const Joi = require('joi');

export const paramsSchema = {
  projectName: Joi.string().required(),
  scenarioName: Joi.string().required()
};

export const paramSchemaNotification = {
  ...paramsSchema,
  notificationId: Joi.string().required()
};

export const querySchema = {
  limit: Joi.number().integer().min(0).max(100),
  offset: Joi.number().integer()
};

export const scenarioNotificationBodySchema = {
  url: Joi.string().max(400).required(),
  type: Joi.string().valid('ms-teams').required(),
  name: Joi.string().min(1).max(100).required()
};


export const updateScenarioSchema = {
  ...scenarioSchema,
  analysisEnabled: Joi.boolean().required(),
  zeroErrorToleranceEnabled: Joi.boolean().required(),
  deleteSamples: Joi.boolean().required(),
  thresholds: Joi.object({
    enabled: Joi.boolean().required(),
    errorRate: Joi.number().min(0).max(100).strict().required(),
    throughput: Joi.number().min(0).max(100).strict().required(),
    percentile: Joi.number().min(0).max(100).strict().required()
  })
};
