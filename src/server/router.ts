import { ItemsRoutes } from './routes/item';
import { ProjectRoutes } from './routes/project';
import { ScenarioRoutes } from './routes/scenario';
import { LabelRoutes } from './routes/label';
import { TestDataSetup } from './routes/test-data-setup';
import { AuthRoutes } from './routes/auth';
import { ApiTokensRoutes } from './routes/api-token';
const env = process.env.ENVIRONMENT;

export class Router {
  private projectRoutes: ProjectRoutes;
  private scenarioRoutes: ScenarioRoutes;
  private itemRoutes: ItemsRoutes;
  private labelRoutes: LabelRoutes;
  private authRoutes: AuthRoutes;
  private apiTokenroutes: ApiTokensRoutes;
  private testDataSetup: TestDataSetup;
  constructor() {
    this.projectRoutes = new ProjectRoutes();
    this.scenarioRoutes = new ScenarioRoutes();
    this.itemRoutes = new ItemsRoutes();
    this.labelRoutes = new LabelRoutes();
    this.authRoutes = new AuthRoutes()
    this.apiTokenroutes = new ApiTokensRoutes();
    this.testDataSetup = new TestDataSetup();
  }

  public getRoutes(app) {
    this.projectRoutes.routes(app);
    this.scenarioRoutes.routes(app);
    this.itemRoutes.routes(app);
    this.labelRoutes.routes(app);
    this.apiTokenroutes.routes(app);
    this.authRoutes.routes(app);
    if (env === 'CI' || env === 'DEV') {
      this.testDataSetup.routes(app);
    }
  }
}
