import { scenarioSchema } from "./project-schema"
import * as Joi from "joi"
import { ENVIRONMENT_MAX_LENGTH } from "../controllers/item/create-item-const"

const MAX_NUMBER = 100
const URL_MAX_LENGTH = 400
const MAX_NOTE_LENGTH = 200
const MAX_MIN_TEST_DURATION = 1000

export const paramsSchema = {
  projectName: Joi.string().required(),
  scenarioName: Joi.string().required(),
}

export const scenarioShareTokenParamsSchema = {
  ...paramsSchema,
  shareTokenId: Joi.string().required(),
}

export const environmentQuerySchema = {
  environment: Joi.string().max(ENVIRONMENT_MAX_LENGTH).allow(""),
  token: Joi.string(),
}

export const paramSchemaNotification = {
  ...paramsSchema,
  notificationId: Joi.string().required(),
}

export const querySchema = {
  limit: Joi.number().integer().min(0).max(MAX_NUMBER),
  offset: Joi.number().integer(),
  environment: environmentQuerySchema.environment,
}

export const scenarioNotificationBodySchema = {
  url: Joi.string().max(URL_MAX_LENGTH).required(),
  type: Joi.string().valid(["ms-teams", "gchat", "slack"]).required(),
  name: Joi.string().min(1).max(MAX_NUMBER).required(),
}


export const updateScenarioSchema = {
  ...scenarioSchema,
  analysisEnabled: Joi.boolean().required(),
  zeroErrorToleranceEnabled: Joi.boolean().required(),
  minTestDuration: Joi.number().min(0).max(MAX_MIN_TEST_DURATION).required(),
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
  apdexSettings: Joi.object({
    enabled: Joi.boolean().required(),
    toleratingThreshold: Joi.number().required(),
    satisfyingThreshold: Joi.number().min(0).required(),
  }),
  userSettings: Joi.object({
    requestStats: Joi.object({
      samples: Joi.boolean().required(),
      avg: Joi.boolean().required(),
      standardDeviation: Joi.boolean().required(),
      min: Joi.boolean().required(),
      max: Joi.boolean().required(),
      p50: Joi.boolean().required(),
      p90: Joi.boolean().required(),
      p95: Joi.boolean().required(),
      p99: Joi.boolean().required(),
      throughput: Joi.boolean().required(),
      network: Joi.boolean().required(),
      errorRate: Joi.boolean().required(),
      failures: Joi.boolean().required(),
      apdex: Joi.boolean().required(),
    }).required(),
  }).required(),
}


export const scenarioTrendsSettings = Joi.object({
  aggregatedTrends: Joi.boolean().required(),
  labelMetrics: Joi.object({
    errorRate: Joi.boolean().required(),
    throughput: Joi.boolean().required(),
    percentile90: Joi.boolean().required(),
  }),
})

export const scenarioShareToken = Joi.object({
  note: Joi.string().max(MAX_NOTE_LENGTH),
})
