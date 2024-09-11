import * as express from "express"
import * as bodyParser from "body-parser"
import * as pgp from "pg-promise"
import * as boom from "boom"
import * as winston from "winston"
import * as compression from "compression"
import * as expressWinston from "express-winston"
import { logger } from "./logger"
import { Router } from "./server/router"
import * as http from "http"
import { v4 as uuidv4 } from "uuid"
import { config } from "./server/config"
import { StatusCode } from "./server/utils/status-code"
import { NextFunction, Request, Response } from "express"
import { PgError } from "./server/errors/pgError"
import { bree } from "./server/utils/scheduled-tasks/scheduler"
import helmet from "helmet"
import { AnalyticsEvent } from "./server/utils/analytics/anyltics-event"
import { setInstanceId } from "./server/utils/analytics/set-instance-id"

const DEFAULT_PORT = 5000
const PORT = process.env.PORT || DEFAULT_PORT

export class App {
  app: express.Application
  router: Router = new Router()
  private server: http.Server

  constructor() {
    this.app = express()
    this.config()
    this.router.getRoutes(this.app)
    this.databaseErrorHandler()
    this.errorHandler()
  }

  private config(): void {
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.use(compression())
    this.app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console(),
      ],
      meta: false,
      expressFormat: true,
      colorize: false,
    }))
    this.app.use(helmet())

    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Methods", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, x-access-token, Content-Type, Accept")
      next()
    })
  }

  private errorHandler() {
    // eslint-disable-next-line no-unused-vars
    this.app.use(function (error: Error, req: Request, res: Response, next: NextFunction) {
      if (boom.isBoom(error)) {
        const { payload: { message } } = error.output
        return res.status(error.output.statusCode).json({ message })
      }
      const errorId = uuidv4()
      logger.error(`Unexpected error: ${error}, errorId: ${errorId}`)
      AnalyticsEvent.reportUnexpectedError(error)
      return res.status(StatusCode.InternalError).json({ message: `Unexpected error occurred: ${errorId}` })

    })
  }

  private databaseErrorHandler() {
    this.app.use(function (error: PgError, req: Request, res: Response, next: NextFunction) {
      logger.error(error)
      if (error instanceof pgp.errors.QueryResultError) {
        return next(boom.notFound())
      }
      if (error?.code === "ECONNREFUSED") {
        return next(boom.serverUnavailable(`Could not connect to the database: ${error.address}:${error.port}`))
      }
      return next(error)

    })
  }

  listen() {
    if (!config.jwtToken || !config.jwtTokenLogin) {
      logger.error("Please provide JWT_TOKEN and JWT_TOKEN_LOGIN env vars")
      process.exit(1)
    }
    this.server = this.app.listen(PORT,
        () => {
          logger.info("Express server listening on port " + PORT)
          bree.start().then(() => {
            setInstanceId()
            logger.info("Bree scheduler was started")
            if (process.env.OPT_OUT_ANALYTICS === "true") {
              bree.stop("analytics-report").then(() => {
                logger.info("Analytics task was opted-out")
              })
            } else {
              logger.info("By using this app you agree with the use of analytics in this app to help improve" +
                  " user experience and the overall functionality of the app.")
            }
          })
        })
    return this.server
  }

  close() {
    return this.server.close(() => {
      logger.info("Server closed")
    })
  }
}
