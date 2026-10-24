import * as Joi from "joi"
import { ALLOWED_PERIOD } from "../controllers/item/shared/constants"
import { newAsyncItemStartBodySchema } from "./item-schema"
import { scenarioNotificationBodySchema } from "./scenario-schema"
import { newUserSchema } from "./users-schema"
import { AllowedRoles } from "../middleware/authorization-middleware"

describe("Joi schema definitions", () => {
    it("accepts configured allowed values when schemas pass them as variadic arguments", () => {
        const asyncItemValidation = newAsyncItemStartBodySchema.validate({
            environment: "test",
            hostname: "",
            note: "",
            resourcesLink: "",
            keepTestRunsPeriod: ALLOWED_PERIOD[0],
        })
        const userValidation = Joi.object(newUserSchema).validate({
            username: "testuser",
            password: "password",
            role: AllowedRoles.Admin,
        })
        const notificationValidation = Joi.object(scenarioNotificationBodySchema).validate({
            channel: "slack",
            name: "Build notification",
            type: "report_detail",
            url: "https://example.com/webhook",
        })

        expect(asyncItemValidation.error).toBeUndefined()
        expect(userValidation.error).toBeUndefined()
        expect(notificationValidation.error).toBeUndefined()
    })
})
