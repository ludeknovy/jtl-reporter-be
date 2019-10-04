import { ItemsRoutes } from './routes/item';
import { ProjectRoutes } from './routes/project';
import { ScenarioRoutes } from './routes/scenario';
import { LabelRoutes } from './routes/label';

export class Router {
  private projectRoutes: ProjectRoutes;
  private scenarioRoutes: ScenarioRoutes;
  private itemRoutes: ItemsRoutes;
  private labelRoutes: LabelRoutes;
  constructor() {
    this.projectRoutes = new ProjectRoutes();
    this.scenarioRoutes = new ScenarioRoutes();
    this.itemRoutes = new ItemsRoutes();
    this.labelRoutes = new LabelRoutes();
  }

  public getRoutes(app) {
    this.projectRoutes.routes(app);
    this.scenarioRoutes.routes(app);
    this.itemRoutes.routes(app);
    this.labelRoutes.routes(app);
  }
}
