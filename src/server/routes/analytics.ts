import * as express from "express"
import { Response } from "express"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { bodySchemaValidator } from "../schema-validator/schema-validator-middleware"
import { wrapAsync } from "../errors/error-handler"
import { analyticsEventSchema } from "../schema-validator/analytics-schema"
import { trackAnalyticsEventController } from "../controllers/analytics/track-analytics-event-controller"
import { IGetUserAuthInfoRequest } from "../middleware/request.model"

export class AnalyticsRoutes {
    routes(app: express.Application): void {
        app.post("/api/analytics/events",
            authenticationMiddleware,
            bodySchemaValidator(analyticsEventSchema),
            wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => trackAnalyticsEventController(req, res)))
    }
}
