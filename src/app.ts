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
import { config } from "./server/config"
import { StatusCode } from "./server/utils/status-code"
import { NextFunction, Request, Response } from "express"
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
      console.log("ERROR_HANDLER")
      if (boom.isBoom(error)) {
        const { payload: { message } } = error.output
        return res.status(error.output.statusCode).json({ message })
      }
        logger.error(`Unexpected error: ${error}`)
        return res.status(StatusCode.InternalError).json({ message: "Something went wrong" })

    })
  }

  private databaseErrorHandler() {
    this.app.use(function (error: Error, req: Request, res: Response, next: NextFunction) {
      logger.info("DB_HANDLER")
      logger.error(error)
      if (error instanceof pgp.errors.QueryResultError) {
        return next(boom.notFound())
      }
      return next(error)

    })
  }

  listen() {
    if (!config.jwtToken || !config.jwtTokenLogin) {
      logger.error("Please provide JWT_TOKEN and JWT_TOKEN_LOGIN env vars")
      process.exit(1)
    }
    return this.app.listen(PORT, () => {
      logger.info("Express server listening on port " + PORT)
    })
  }

  close() {
    return this.server.close(() => {
      logger.info("Server closed")
    })
  }
}
