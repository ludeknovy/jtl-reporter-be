import {
    Request, Response, NextFunction, Application,
} from "express"
import { getInitController } from "../controllers/init/initialize-controller"
import { wrapAsync } from "../errors/error-handler"


export class InitRoutes {
    routes(app: Application): void {

        app.route("/api/info")

            .get(wrapAsync((req: Request, res: Response, next: NextFunction) =>
                getInitController(req, res, next)))
    }
}
