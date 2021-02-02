import * as request from 'supertest';
import { States } from '../contract/states.model';
import { stateSetup, userSetup } from './helper/state';

describe('Scenario', () => {
  let credentials;
  beforeAll(async () => {
    ({ data: credentials } = await userSetup());
  });
  describe('POST /projects/{projectName}/scenarios', () => {
    it('should be able to create new scenario', async () => {
      await stateSetup(States.ExistingProject);
      await request(__server__)
        .post('/api/projects/test-project/scenarios')
        .set(__tokenHeaderKey__, credentials.token)
        .send({ scenarioName: 'test-scenario' })
        .set('Accept', 'application/json')
        .expect(201);
    });
    it('should not be able to create two scenarios with same name', async () => {
      await stateSetup(States.ExistingScenario);
      await request(__server__)
        .post('/api/projects/test-project/scenarios')
        .set(__tokenHeaderKey__, credentials.token)
        .send({ scenarioName: 'test-scenario' })
        .set('Accept', 'application/json')
        .expect(409);
    });
    it('should return 400 when no scenarioName provided', async () => {
      await stateSetup(States.ExistingScenario);
      await request(__server__)
        .post('/api/projects/test-project/scenarios')
        .set(__tokenHeaderKey__, credentials.token)
        .send({})
        .set('Accept', 'application/json')
        .expect(400);
    });
  });
  describe('PUT /projects/{projectName}/scenarios/{scenarioName}', () => {
    it('should be able to update scenario', async () => {
      await stateSetup(States.ExistingScenario);
      await request(__server__)
        .put('/api/projects/test-project/scenarios/test-scenario')
        .set(__tokenHeaderKey__, credentials.token)
        .send({ scenarioName: 'test-scenario' })
        .set('Accept', 'application/json')
        .expect(204);
    });
  });
  describe('DELETE /projects/{projectName}/scenarios/{scenarioName}', () => {
    it('should be able to delete scenario', async () => {
      await stateSetup(States.ExistingScenario);
      await request(__server__)
        .delete('/api/projects/test-project/scenarios/test-scenario')
        .set(__tokenHeaderKey__, credentials.token)
        .set('Accept', 'application/json')
        .expect(204);
    });
  });
});
