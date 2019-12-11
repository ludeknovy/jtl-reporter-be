import * as request from 'supertest';
import { stateSetup, userSetup } from './helper/state';
import { States } from '../contract/states.model';
import { ItemStatus } from '../../server/queries/items.model';
import * as path from 'path';


describe('Items', () => {
  let credentials;
  beforeAll(async () => {
    credentials = await userSetup();
  });
  describe('POST /projects/{projectName}/scenarios/{scenarioName}/items', () => {
    it('should be able to create test item', async () => {
      await stateSetup(States.ExistingScenario);
      await request(__server__)
        .post('/api/projects/test-project/scenarios/test-scenario/items')
        .set(__tokenHeaderKey__, credentials.token)
        .attach('kpi', path.join(__dirname, './test-data/kpi.jtl'), 'kpi.jtl')
        .field('environment', 'test-environment')
        .field('note', 'test-note')
        .field('status', ItemStatus.Passed)
        .field('hostname', 'localhost')
        .expect(200);
    });
  });
  describe('PUT /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}', () => {
    it('should be able to update test item', async () => {
      const { itemId } = await stateSetup(States.ExistingTestItem);
      await request(__server__)
        .put(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}`)
        .set('Accept', 'application/json')
        .send({
          environment: 'new-test-environment',
          note: 'new-test-note',
          base: true
        })
        .expect(204);
    });
  });
  describe('DELETE /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}', () => {
    it('should be able to delete test item', async () => {
      const { itemId } = await stateSetup(States.ExistingTestItem);
      await request(__server__)
        .delete(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}`)
        .set('Accept', 'application/json')
        .send({
          environment: 'new-test-environment',
          note: 'new-test-note',
          base: true
        })
        .expect(204);
    });
  });
});
