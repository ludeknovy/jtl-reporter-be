import { analyticsEventSchema } from "./analytics-schema"

describe("analyticsEventSchema", () => {
    it.each([
        [{ event: "reportViewed" }],
        [{ event: "comparisonOpened" }],
        [{ event: "comparisonOpened", comparisonType: "manual" }],
        [{ event: "comparisonOpened", comparisonType: "baseline" }],
    ])("accepts supported payload %j", (payload) => {
        const { error } = analyticsEventSchema.validate(payload)

        expect(error).toBeUndefined()
    })

    it.each([
        [{ event: "unsupportedEvent" }],
        [{ event: "reportViewed", comparisonType: "manual" }],
        [{ event: "comparisonOpened", comparisonType: "unsupported" }],
        [{ event: "reportViewed", distinct_id: "client-supplied-id" }],
        [{ event: "reportViewed", extra: "value" }],
    ])("rejects unsupported payload %j", (payload) => {
        const { error } = analyticsEventSchema.validate(payload)

        expect(error).toBeDefined()
    })
})
