import * as Joi from "joi"

const MIN_LENGTH = 3
const MAX_LENGTH = 50

export const createNewProjectSchema = {
  projectName: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).required(),
  projectMembers: Joi.array().items(Joi.string().guid()),
}

export const updateProjectSchema = {
  projectName: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).required(),
  upsertScenario: Joi.boolean().required(),
  topMetricsSettings: Joi.object({
    virtualUsers: Joi.boolean().required(),
    errorRate: Joi.boolean().required(),
    percentile: Joi.boolean().required(),
    throughput: Joi.boolean().required(),
    network: Joi.boolean().required(),
    avgLatency: Joi.boolean().required(),
    avgResponseTime: Joi.boolean().required(),
    avgConnectionTime: Joi.boolean().required(),
    networkSent: Joi.boolean().required(),
    networkReceived: Joi.boolean().required(),
    errorCount: Joi.boolean().required(),
  }),
}

export const projectNameParam = {
  projectName: Joi.string().required(),
}

export const scenarioSchema = {
  scenarioName: Joi.string().min(1).max(MAX_LENGTH).required(),
}
