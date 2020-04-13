import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as pgp from 'pg-promise';
import * as boom from 'boom';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import { logger } from './logger';
import { Router } from './server/router';
import * as swaggerUi from 'swagger-ui-express';
import { MongoUtils } from './db/mongoUtil';
import * as http from 'http';
const swaggerDocument = require('../openapi.json');

const PORT = 5000;

export class App {
  public app: express.Application;
  public router: Router = new Router();
  private server: http.Server;

  constructor() {
    this.app = express();
    this.config();
    this.router.getRoutes(this.app);
    this.databaseErrorHandler();
    this.errorHandler();
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console()
      ],
      meta: false,
      expressFormat: true,
      colorize: false
    }));
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, x-access-token, Content-Type, Accept');
      next();
    });

  }

  private errorHandler() {
    this.app.use(function (error, req, res, next) {
      logger.error(error);
      if (boom.isBoom(error)) {
        const { payload: { message } } = error.output;
        return res.status(error.output.statusCode).json({ message });
      } else {
        return res.status(500).json({ message: `Something went wrong` });
      }
    });
  }

  private databaseErrorHandler() {
    this.app.use(function (error, req, res, next) {
      logger.error(error);
      if (error instanceof pgp.errors.QueryResultError) {
        return next(boom.notFound());
      } else {
        return next(error);
      }
    });
  }

  public async listen() {
    await MongoUtils.connect();
    return this.server = this.app.listen(PORT, () => {
      logger.info('Express server listening on port ' + PORT);
    });
  }

  public async close() {
    // @ts-ignore
    return this.server.close(() => {
      logger.info("Server closed");
    });
  }
}
