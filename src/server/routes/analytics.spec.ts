import { AnalyticsRoutes } from "./analytics"
import { trackAnalyticsEventController } from "../controllers/analytics/track-analytics-event-controller"

jest.mock("../controllers/analytics/track-analytics-event-controller", () => ({
    trackAnalyticsEventController: jest.fn().mockResolvedValue(undefined),
}))

describe("AnalyticsRoutes", () => {
    it("registers the authenticated analytics event endpoint with validation", () => {
        const app = {
            post: jest.fn(),
        }

        new AnalyticsRoutes().routes(app as any)

        expect(app.post).toHaveBeenCalledTimes(1)
        const [path, authentication, validation, controller] = app.post.mock.calls[0]
        expect(path).toBe("/api/analytics/events")
        expect(authentication).toEqual(expect.any(Function))
        expect(validation).toEqual(expect.any(Function))
        expect(controller).toEqual(expect.any(Function))
    })

    it("forwards requests to the analytics controller", async () => {
        const app = { post: jest.fn() }
        const request = {}
        const response = {}
        const next = jest.fn()

        new AnalyticsRoutes().routes(app as any)
        const [, , , routeHandler] = app.post.mock.calls[0]
        routeHandler(request, response, next)
        await Promise.resolve()

        expect(trackAnalyticsEventController).toHaveBeenCalledWith(request, response)
    })
})
