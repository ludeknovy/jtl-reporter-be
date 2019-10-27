import * as request from 'supertest';
import { States } from '../contract/states.model';
import { stateSetup } from './helper/state';

describe('Scenario', () => {
  describe('POST /projects/{projectName}/scenarios', () => {
    it('should be able to create new scenario', async (done) => {
      await stateSetup(States.ExistingProject);
      request(__server__)
        .post('/api/projects/test-project/scenarios')
        .send({ scenarioName: `test-scenario` })
        .set('Accept', 'application/json')
        .expect(201)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
    it('should not be able to create two scenarios with same name', async (done) => {
      await stateSetup(States.ExistingScenario);
      request(__server__)
        .post('/api/projects/test-project/scenarios')
        .send({ scenarioName: `test-scenario` })
        .set('Accept', 'application/json')
        .expect(409)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
    it('should return 400 when no scenarioName provided', async (done) => {
      await stateSetup(States.ExistingScenario);
      request(__server__)
        .post('/api/projects/test-project/scenarios')
        .send({})
        .set('Accept', 'application/json')
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
  });
  describe('PUT /projects/{projectName}/scenarios/{scenarioName}', () => {
    it('should be able to update scenario', async (done) => {
      await stateSetup(States.ExistingScenario);
      request(__server__)
        .put('/api/projects/test-project/scenarios/test-scenario')
        .send({ scenarioName: `test-scenario` })
        .set('Accept', 'application/json')
        .expect(204)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
  });
  describe('DELETE /projects/{projectName}/scenarios/{scenarioName}', () => {
    it('should be able to delete scenario', async (done) => {
      await stateSetup(States.ExistingScenario);
      request(__server__)
        .delete('/api/projects/test-project/scenarios/test-scenario')
        .set('Accept', 'application/json')
        .expect(204)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
     });
  });
});
