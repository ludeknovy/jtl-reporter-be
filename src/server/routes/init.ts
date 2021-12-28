import { Request, Response, NextFunction, Application } from 'express';
import { getInitController } from '../controllers/init/initialize-controller';
import { wrapAsync } from '../errors/error-handler';


export class InitRoutes {
  public routes(app: Application): void {

    app.route('/api/info')

      .get(wrapAsync(async (req: Request, res: Response, next: NextFunction) =>
        await getInitController(req, res, next)));
  }
}
