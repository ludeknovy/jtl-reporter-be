import * as Joi from "joi"


export const globalSettingsBodySchema = {
    projectAutoprovisioning: Joi.boolean().required(),
}
