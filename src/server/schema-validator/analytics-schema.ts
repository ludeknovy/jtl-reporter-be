import * as Joi from "joi"

export const analyticsEventSchema = Joi.object({
    event: Joi.string().valid("reportViewed", "comparisonOpened").required(),
    comparisonType: Joi.when("event", {
        is: "comparisonOpened",
        then: Joi.string().valid("manual", "baseline").optional(),
        otherwise: Joi.forbidden(),
    }),
}).unknown(false)
