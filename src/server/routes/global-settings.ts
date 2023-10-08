import * as express from "express"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { AllowedRoles, authorizationMiddleware } from "../middleware/authorization-middleware"
import { wrapAsync } from "../errors/error-handler"
import { IGetUserAuthInfoRequest } from "../middleware/request.model"
import { Response } from "express"
import { getGlobalSettingsController } from "../controllers/global-settings/get-global-settings-controller"
import { updateGlobalSettingsController } from "../controllers/global-settings/update-global-settings-controller"
import {bodySchemaValidator} from "../schema-validator/schema-validator-middleware";
import {globalSettingsBodySchema} from "../schema-validator/global-settings";

export class GlobalSettings {
    routes(app: express.Application): void {
        app.route("/api/global-settings")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Admin]),
                wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => getGlobalSettingsController(req, res))
            )

            .put(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Admin]),
                bodySchemaValidator(globalSettingsBodySchema),
                wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => updateGlobalSettingsController(req, res))
            )
    }
}
