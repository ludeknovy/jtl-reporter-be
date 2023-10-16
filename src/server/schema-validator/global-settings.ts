import * as Joi from "joi"


export const globalSettingsBodySchema = {
    projectAutoProvisioning: Joi.boolean().required(),
}
