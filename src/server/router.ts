import { ItemsRoutes } from "./routes/item"
import { ProjectRoutes } from "./routes/project"
import { ScenarioRoutes } from "./routes/scenario"
import { LabelRoutes } from "./routes/label"
import { TestDataSetup } from "./routes/test-data-setup"
import { AuthRoutes } from "./routes/auth"
import { ApiTokensRoutes } from "./routes/api-token"
import { UsersRoutes } from "./routes/users"
import { InitRoutes } from "./routes/init"
const env = process.env.ENVIRONMENT

export class Router {
  private projectRoutes: ProjectRoutes
  private scenarioRoutes: ScenarioRoutes
  private itemRoutes: ItemsRoutes
  private labelRoutes: LabelRoutes
  private authRoutes: AuthRoutes
  private apiTokenRoutes: ApiTokensRoutes
  private userRoutes: UsersRoutes
  private testDataSetup: TestDataSetup
  private initRoutes: InitRoutes
  constructor() {
    this.projectRoutes = new ProjectRoutes()
    this.scenarioRoutes = new ScenarioRoutes()
    this.itemRoutes = new ItemsRoutes()
    this.labelRoutes = new LabelRoutes()
    this.authRoutes = new AuthRoutes()
    this.apiTokenRoutes = new ApiTokensRoutes()
    this.userRoutes = new UsersRoutes()
    this.testDataSetup = new TestDataSetup()
    this.initRoutes = new InitRoutes()
  }

  getRoutes(app) {
    this.projectRoutes.routes(app)
    this.scenarioRoutes.routes(app)
    this.itemRoutes.routes(app)
    this.labelRoutes.routes(app)
    this.apiTokenRoutes.routes(app)
    this.userRoutes.routes(app)
    this.authRoutes.routes(app)
    if (env === "CI" || env === "DEV") {
      this.testDataSetup.routes(app)
    }
    this.initRoutes.routes(app)
  }
}
