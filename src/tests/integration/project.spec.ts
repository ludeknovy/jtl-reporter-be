import { App } from '../../app';
import * as request from 'supertest';
import { States } from '../contract/states.model';
import { stateSetup } from './helper/state';


describe('Projects', () => {
  describe('POST /projects', () => {
    it('should be able to create new project', async (done) => {
      await stateSetup(States.EmptyDb);
      request(__server__)
        .post('/api/projects')
        .send({ projectName: `test-project-000` })
        .set('Accept', 'application/json')
        .expect(201)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
    it('should return 400 when no projectName provided', async (done) => {
      await stateSetup(States.EmptyDb);
      request(__server__)
        .post('/api/projects')
        .send({ })
        .set('Accept', 'application/json')
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
    it('should not be able to create two project with same name', async (done) => {
      await stateSetup(States.ExistingProject);
      request(__server__)
        .post('/api/projects')
        .send({ projectName: `test-project` })
        .set('Accept', 'application/json')
        .expect(409)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
  });
  describe('PUT /projects/${projectName}', () => {
    it('should be able to update project', async (done) => {
      await stateSetup(States.ExistingProject);
      request(__server__)
        .put('/api/projects/test-project')
        .send({ projectName: `test-project` })
        .set('Accept', 'application/json')
        .expect(204)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
  });
  describe('DELETE /projects/${projectName}', () => {
    it('should be able to delete project', async (done) => {
      await stateSetup(States.ExistingProject);
      request(__server__)
        .delete('/api/projects/test-project')
        .set('Accept', 'application/json')
        .expect(204)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
  });
});
