import { ItemsRoutes } from './routes/item';
import { ProjectRoutes } from './routes/project';
import { ScenarioRoutes } from './routes/scenario';

export class Router {
  private projectRoutes: ProjectRoutes;
  private scenarioRoutes: ScenarioRoutes;
  private itemRoutes: ItemsRoutes;
  constructor() {
    this.projectRoutes = new ProjectRoutes();
    this.scenarioRoutes = new ScenarioRoutes();
    this.itemRoutes = new ItemsRoutes();
  }

  public getRoutes(app) {
    this.projectRoutes.routes(app);
    this.scenarioRoutes.routes(app);
    this.itemRoutes.routes(app);
  }
}
