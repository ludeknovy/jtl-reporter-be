import { ItemsRoutes } from './routes/item';
import { ProjectRoutes } from './routes/project';
import { ScenarioRoutes } from './routes/scenario';
import { LabelRoutes } from './routes/label';
import { TestDataSetup } from './routes/test-data-setup';
const env = process.env.ENVIRONMENT;

export class Router {
  private projectRoutes: ProjectRoutes;
  private scenarioRoutes: ScenarioRoutes;
  private itemRoutes: ItemsRoutes;
  private labelRoutes: LabelRoutes;
  private testDataSetup: TestDataSetup;
  constructor() {
    this.projectRoutes = new ProjectRoutes();
    this.scenarioRoutes = new ScenarioRoutes();
    this.itemRoutes = new ItemsRoutes();
    this.labelRoutes = new LabelRoutes();
    this.testDataSetup = new TestDataSetup();
  }

  public getRoutes(app) {
    this.projectRoutes.routes(app);
    this.scenarioRoutes.routes(app);
    this.itemRoutes.routes(app);
    this.labelRoutes.routes(app);
    if (env === 'CI' || env === 'DEV') {
      this.testDataSetup.routes(app);
    }
  }
}
