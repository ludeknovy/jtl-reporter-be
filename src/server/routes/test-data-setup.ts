import * as express from "express"
import { wrapAsync } from "../errors/error-handler"
import { Request, Response } from "express"
import { bodySchemaValidator } from "../schema-validator/schema-validator-middleware"
import { testDataSchema } from "../schema-validator/test-data-schema"
import { States } from "../../tests/contract/states.model"
import { db } from "../../db/db"
import { createNewProject } from "../queries/projects"
import { createNewScenario } from "../queries/scenario"
import { createNewItem, saveItemStats } from "../queries/items"
import { testStats, testOverview } from "../../test-data/test-stats"
import { createUserInDB } from "../controllers/users/create-new-user-controller"
import { getUser } from "../queries/auth"
import { generateToken } from "../controllers/auth/helper/token-generator"
import { createNewApiToken } from "../queries/api-tokens"
import * as uuid from "uuid"
import { ReportStatus } from "../queries/items.model"
import { StatusCodes } from "../utils/status-codes"

export class TestDataSetup {

  routes(app: express.Application): void {
    app.route("/api/contract/states")
      .post(
        bodySchemaValidator(testDataSchema),
        wrapAsync(async (req: Request, res: Response) => {
          const { state } = req.body
          // eslint-disable-next-line max-len
          await db.any({ text: "TRUNCATE jtl.charts, jtl.projects, jtl.data, jtl.item_stat, jtl.items, jtl.scenario CASCADE" })
          switch (state) {
            case States.ExistingProject:
              await db.any(createNewProject("test-project"))
              res.sendStatus(StatusCodes.Created)
              break
            case States.ExistingScenario:
              await db.any(createNewProject("test-project"))
              await db.any(createNewScenario("test-project", "test-scenario"))
              res.sendStatus(StatusCodes.Created)
              break
            case States.ExistingTestItem:
              await db.any(createNewProject("test-project"))
              await db.any(createNewScenario("test-project", "test-scenario"))
                // eslint-disable-next-line no-case-declarations
              const [item] = await db.any(createNewItem("test-scenario",
                  "2019-09-22 20:20:23.265", "localhost", "test note",
                  "1", "test-project", "localhost", ReportStatus.Ready))
              await db.any(saveItemStats(
                item.id, JSON.stringify(testStats),
                JSON.stringify(testOverview),
                JSON.stringify([])))
              res.status(StatusCodes.Ok).send({ itemId: item.id })
              break
            case States.EmptyDb:
              res.sendStatus(StatusCodes.Created)
              break
            case States.NoUsers:
              await db.any({ text: "TRUNCATE jtl.users CASCADE" })
              res.sendStatus(StatusCodes.Created)
              break
            case States.ExistingApiKey:
                // eslint-disable-next-line no-case-declarations
              const TOKEN = "at-testToken"
              await createUserInDB("test-user", "test00010")
                // eslint-disable-next-line no-case-declarations
              const { id } = await db.one(getUser("test-user"))
              await db.any(createNewApiToken(TOKEN, "test-token", id))
              res.status(StatusCodes.Ok).send({ token: TOKEN })
              break
            default:
              res.sendStatus(StatusCodes.BadRequest)
              break
          }
        }))
    app.route("/api/contract/test-user")
      .post(
        wrapAsync(async (req: Request, res: Response) => {
          await db.any({ text: "TRUNCATE jtl.users CASCADE" })

          const username = "contract"
          const password = "YK8K95TKHVPprcLv"
          await createUserInDB(username, password)
          const { id } = await db.one(getUser(username))
          const token = generateToken(id)
          res.status(StatusCodes.Ok).send({ token, username, password, id })
        })
      )

    app.route("/api/contract/api-token")
      .post(
        wrapAsync(async (req: Request, res: Response) => {
          await db.any({ text: "TRUNCATE jtl.api_tokens CASCADE" })
          const TOKEN = `at-${uuid()}`
          await createUserInDB("test-user", "test0000")
          const { id } = await db.one(getUser("test-user"))
          await db.any(createNewApiToken(TOKEN, "test-token", id))
          res.status(StatusCodes.Ok).send({ token: TOKEN })
        })
      )
  }
}
