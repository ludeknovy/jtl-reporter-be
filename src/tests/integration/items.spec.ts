import * as request from 'supertest';
import { stateSetup, userSetup, apiTokenSetup } from './helper/state';
import { States } from '../contract/states.model';
import { ItemStatus } from '../../server/queries/items.model';
import * as path from 'path';

describe('Items', () => {
  let credentials;
  let token;
  beforeAll(async () => {
    try {
      ({ data: credentials } = await userSetup());
      ({ data: { token } } = await apiTokenSetup());
    } catch (error) {
      console.log(error);
    }

  });
  describe('POST /api/projects/:projectName/scenarios/:scenarioName/items/start-async', () => {
    it('should be able to start async item', async () => {
      await stateSetup(States.ExistingScenario);
      await request(__server__)
        .post('/api/projects/test-project/scenarios/test-scenario/items/start-async')
        .set(__tokenHeaderKey__, credentials.token)
        .set('Accept', 'application/json')
        .send({ environment: 'test' })
        .expect(201);
    });
  });
  describe('PUT /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}', () => {
    it('should be able to update test item', async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem);
      await request(__server__)
        .put(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}`)
        .set(__tokenHeaderKey__, credentials.token)
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
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem);
      await request(__server__)
        .delete(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}`)
        .set(__tokenHeaderKey__, credentials.token)
        .set('Accept', 'application/json')
        .send({
          environment: 'new-test-environment',
          note: 'new-test-note',
          base: true
        })
        .expect(204);
    });
  });
  describe('POST /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}/share-tokens', () => {
    it('should be able to create new share token', async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem);
      await request(__server__)
        .post(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}/share-tokens`)
        .set(__tokenHeaderKey__, credentials.token)
        .set('Accept', 'application/json')
        .send({
          name: 'test-token'
        })
        .expect(201);
    });
  });
  describe('POST /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}/custom-chart-settings', () => {
    it('should be able to upsert chart settings', async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem);
      await request(__server__)
        .post(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}/custom-chart-settings`)
        .set(__tokenHeaderKey__, credentials.token)
        .set('Accept', 'application/json')
        .send([{ name: 'test', metric: 'test' }])
        .expect(200);
    });
  });
  describe('GET /projects/{projectName}/scenarios/{scenarioName}/items/{itemId}/custom-chart-settings', () => {
    it('should be able to upsert chart settings', async () => {
      const { data: { itemId } } = await stateSetup(States.ExistingTestItem);
      await request(__server__)
        .get(`/api/projects/test-project/scenarios/test-scenario/items/${itemId}/custom-chart-settings`)
        .set(__tokenHeaderKey__, credentials.token)
        .set('Accept', 'application/json')
        .expect(200);
    });
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
    it('should be able to create test item with more test columns', async () => {
      await stateSetup(States.ExistingScenario);
      await request(__server__)
        .post('/api/projects/test-project/scenarios/test-scenario/items')
        .set(__tokenHeaderKey__, credentials.token)
        .attach('kpi', path.join(__dirname, './test-data/kpi.jtl'), 'kpi1.jtl')
        .field('environment', 'test-environment')
        .field('note', 'test-note')
        .field('status', ItemStatus.Passed)
        .field('hostname', 'localhost')
        .expect(200);
    });
    it('should be able to create test item with api token', async () => {
      await stateSetup(States.ExistingScenario);
      await request(__server__)
        .post('/api/projects/test-project/scenarios/test-scenario/items')
        .set(__tokenHeaderKey__, token)
        .attach('kpi', path.join(__dirname, './test-data/kpi.jtl'), 'kpi.jtl')
        .field('environment', 'test-environment')
        .field('note', 'test-note')
        .field('status', ItemStatus.Passed)
        .field('hostname', 'localhost')
        .expect(200);
    });
  });
});
