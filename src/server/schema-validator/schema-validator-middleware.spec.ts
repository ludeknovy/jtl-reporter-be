import * as Joi from "joi"
import { StatusCode } from "../utils/status-code"
import { bodySchemaValidator } from "./schema-validator-middleware"

describe("schemaValidator", () => {
    it("validates a plain Joi schema map used by route definitions", () => {
        const next = jest.fn()
        const validateBody = bodySchemaValidator({ name: Joi.string().required() })

        validateBody({ body: { name: "project" } }, {}, next)

        expect(next).toHaveBeenCalledWith()
    })

    it("validates a pre-built Joi object schema", () => {
        const next = jest.fn()
        const validateBody = bodySchemaValidator(Joi.object({ enabled: Joi.boolean().required() }))

        validateBody({ body: { enabled: true } }, {}, next)

        expect(next).toHaveBeenCalledWith()
    })

    it("returns a bad request error when the request does not match the schema", () => {
        const next = jest.fn()
        const validateBody = bodySchemaValidator({ name: Joi.string().required() })

        validateBody({ body: {} }, {}, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0].output.statusCode).toEqual(StatusCode.BadRequest)
    })
})
