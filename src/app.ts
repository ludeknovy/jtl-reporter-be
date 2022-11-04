import * as express from "express"
import * as bodyParser from "body-parser"
import * as pgp from "pg-promise"
import * as boom from "boom"
import * as winston from "winston"
import * as compression from "compression"
import * as expressWinston from "express-winston"
import { logger } from "./logger"
import { Router } from "./server/router"
import * as swaggerUi from "swagger-ui-express"
import * as http from "http"
import { v4 as uuidv4 } from "uuid"
import { config } from "./server/config"
import { StatusCode } from "./server/utils/status-code"
import { NextFunction, Request, Response } from "express"
import { PgError } from "./server/errors/pgError"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerDocument = require("../openapi.json")

const PORT = 5000

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
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

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
    this.server = this.app.listen(PORT, () => {
      logger.info("Express server listening on port " + PORT)
    })
    return this.server
  }

  close() {
    return this.server.close(() => {
      logger.info("Server closed")
    })
  }
}
