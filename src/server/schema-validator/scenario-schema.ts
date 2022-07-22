import { scenarioSchema } from "./project-schema"
import * as Joi from "joi"

const MAX_NUMBER = 100
const URL_MAX_LENGTH = 400

export const paramsSchema = {
  projectName: Joi.string().required(),
  scenarioName: Joi.string().required(),
}

export const paramSchemaNotification = {
  ...paramsSchema,
  notificationId: Joi.string().required(),
}

export const paramSchemaExecutionFile = {
  ...paramsSchema,
  fileId: Joi.string().required(),
}

export const querySchema = {
  limit: Joi.number().integer().min(0).max(MAX_NUMBER),
  offset: Joi.number().integer(),
}

export const scenarioNotificationBodySchema = {
  url: Joi.string().max(URL_MAX_LENGTH).required(),
  type: Joi.string().valid("ms-teams").required(),
  name: Joi.string().min(1).max(MAX_NUMBER).required(),
}


export const updateScenarioSchema = {
  ...scenarioSchema,
  analysisEnabled: Joi.boolean().required(),
  zeroErrorToleranceEnabled: Joi.boolean().required(),
  deleteSamples: Joi.boolean().required(),
  keepTestRunsPeriod: Joi.number().required(),
  generateShareToken: Joi.boolean().required(),
  extraAggregations: Joi.boolean().required(),
  thresholds: Joi.object({
    enabled: Joi.boolean().required(),
    errorRate: Joi.number().min(0).max(MAX_NUMBER).strict().required(),
    throughput: Joi.number().min(0).max(MAX_NUMBER).strict().required(),
    percentile: Joi.number().min(0).max(MAX_NUMBER).strict().required(),
  }),
  labelFilterSettings: Joi.array().items(
    Joi.object({
      labelTerm: Joi.string(),
      operator: Joi.string().valid("match", "includes"),
    })
  ),
  labelTrendChartSettings: Joi.object({
    virtualUsers: Joi.boolean().required(),
    throughput: Joi.boolean().required(),
    avgConnectionTime: Joi.boolean().required(),
    avgLatency: Joi.boolean().required(),
    avgResponseTime: Joi.boolean().required(),
    p90: Joi.boolean().required(),
    p95: Joi.boolean().required(),
    p99: Joi.boolean().required(),
    errorRate: Joi.boolean().required(),
  }),
}
