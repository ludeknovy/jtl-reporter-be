import * as Joi from "joi"

export const createNewProjectSchema = {
  projectName: Joi.string().min(3).max(50).required(),
}

export const updateProjectSchema = {
  projectName: Joi.string().min(3).max(50).required(),
  topMetricsSettings: Joi.object({
    virtualUsers: Joi.boolean().required(),
    errorRate: Joi.boolean().required(),
    percentile: Joi.boolean().required(),
    throughput: Joi.boolean().required(),
    network: Joi.boolean().required(),
    avgLatency: Joi.boolean().required(),
    avgResponseTime: Joi.boolean().required(),
    avgConnectionTime: Joi.boolean().required(),
  }),
}

export const projectNameParam = {
  projectName: Joi.string().required(),
}

export const scenarioSchema = {
  scenarioName: Joi.string().min(1).max(50).required(),
}
