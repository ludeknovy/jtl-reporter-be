import * as Joi from "joi"

const NOTE_MAX_LENGTH = 250
const HOSTNAME_MAX_LENGTH = 200
const ENVIRONMENT_MAX_LENGTH = 50
const TEST_NAME_MAX_LENGTH = 200

const projectName = Joi.string().required()
const environment = Joi.string().min(1).max(ENVIRONMENT_MAX_LENGTH).required()
const scenarioName = Joi.string().required()
const hostname = Joi.string().max(HOSTNAME_MAX_LENGTH).allow("").allow(null)
const note = Joi.string().max(NOTE_MAX_LENGTH).allow("").allow(null)
const itemId = Joi.string().uuid().required()

export const labelParamSchema = {
  projectName,
  scenarioName,
  itemId,
  label: Joi.string().required(),
}

export const shareTokenSchema = Joi.object().keys({
  projectName,
  scenarioName,
  itemId,
  tokenId: Joi.string().uuid().required(),
})

export const paramsSchema = Joi.object().keys({
  projectName,
  scenarioName,
  itemId,
})

export const labelQuerySchema = {
  environment: Joi.string().min(1).required(),
  virtualUsers: Joi.string(),
}

export const updateItemBodySchema = Joi.object().keys({
  note,
  base: Joi.boolean().required(),
  hostname,
  environment,
  name: Joi.string().max(TEST_NAME_MAX_LENGTH).allow("").allow(null),
})

export const newAsyncItemStartBodySchema = Joi.object().keys({
  environment,
  hostname,
  note,
})

export const stopAsyncItemBody = Joi.object().keys({
  itemId,
})

export const newItemParamSchema = Joi.object().keys({
  projectName,
  scenarioName,
})

export const upsertUserItemChartSettings = Joi.array().items(Joi.object().keys({
  name: Joi.string().required(),
  metric: Joi.string().required(),
})).required()
