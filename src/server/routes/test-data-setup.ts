import * as express from 'express';
import { wrapAsync } from '../errors/error-handler';
import { Request, Response } from 'express';
import { bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { testDataSchema } from '../schema-validator/test-data-schema';
import { States } from '../../tests/contract/states.model';
import { db } from '../../db/db';
import { createNewProject } from '../queries/projects';
import { createNewScenario } from '../queries/scenario';
import { createNewItem, saveItemStats } from '../queries/items';
import { testStats, testOverview } from '../../test-data/test-stats';
import { createUserInDB } from '../controllers/users/create-new-user-controller';
import { getUser } from '../queries/auth';
import { generateToken } from '../controllers/auth/login-controller';


export class TestDataSetup {

  public routes(app: express.Application): void {
    app.route('/api/contract/states')
      .post(
        bodySchemaValidator(testDataSchema),
        wrapAsync(async (req: Request, res: Response) => {
          const { state } = req.body;
          // tslint:disable-next-line:max-line-length
          await db.any({ text: 'TRUNCATE jtl.charts, jtl.projects, jtl.data, jtl.item_stat, jtl.items, jtl.scenario CASCADE' });
          switch (state) {
            case States.ExistingProject:
              await db.any(createNewProject('test-project'));
              break;
            case States.ExistingScenario:
              await db.any(createNewProject('test-project'));
              await db.any(createNewScenario('test-project', 'test-scenario'));
              break;
            case States.ExistingTestItem:
              await db.any(createNewProject('test-project'));
              await db.any(createNewScenario('test-project', 'test-scenario'));
              // tslint:disable-next-line:max-line-length
              const [item] = await db.any(createNewItem('test-scenario', '2019-09-22 20:20:23.265', 'localhost', 'test note', '1', 'test-project', 'localhost'));
              await db.any(saveItemStats(item.id, JSON.stringify(testStats), JSON.stringify(testOverview)));
              res.status(200).send({ itemId: item.id });
              break;
            case States.EmptyDb:
              break;
            case States.ExistingLogin:
              const username = 'contract';
              const password = 'YK8K95TKHVPprcLv';
              await createUserInDB(username, password);
              const { id } = db.one(getUser(username));
              const token = generateToken(id);
              res.status(200).send({ token })
            default:
              res.sendStatus(400);
              break;
          }
          res.sendStatus(201);
        }));
  }
}
