import * as Joi from "joi"
import {
    ENVIRONMENT_MAX_LENGTH,
    HOSTNAME_MAX_LENGTH,
    NOTE_MAX_LENGTH,
    RESOURCES_LINK_MAX_LENGTH, TEST_NAME_MAX_LENGTH,
} from "../controllers/item/create-item-const"
import { ALLOWED_PERIOD } from "../controllers/item/shared/constants"


const projectName = Joi.string().required()
const environment = Joi.string().min(1).max(ENVIRONMENT_MAX_LENGTH).required()
const scenarioName = Joi.string().required()
const hostname = Joi.string().max(HOSTNAME_MAX_LENGTH).allow("").allow(null)
const note = Joi.string().max(NOTE_MAX_LENGTH).allow("").allow(null)
const itemId = Joi.string().uuid().required()
const resourcesLink = Joi.string().max(RESOURCES_LINK_MAX_LENGTH).allow("").allow(null)


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
    resourcesLink,
})

export const newAsyncItemStartBodySchema = Joi.object().keys({
    environment,
    hostname,
    note,
    resourcesLink,
    keepTestRunsPeriod: Joi.number().valid(ALLOWED_PERIOD),
})

export const newItemParamSchema = Joi.object().keys({
    projectName,
    scenarioName,
})

export const upsertUserItemChartSettings = Joi.array().items(Joi.object().keys({
    name: Joi.string().required(),
    metric: Joi.string().required(),
})).required()

export const stopItemAsyncBodySchema = Joi.object().keys({
    status: Joi.string().regex(/^(10|[0-3])$/),
})
