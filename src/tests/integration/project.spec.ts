import * as request from 'supertest';
import { States } from '../contract/states.model';
import { stateSetup, userSetup } from './helper/state';


describe('Projects', () => {
  let credentials;
  beforeAll(async () => {
    credentials = await userSetup();
  });
  describe('POST /projects', () => {
    it('should be able to create new project', async () => {
      await stateSetup(States.EmptyDb);
      await request(__server__)
        .post('/api/projects')
        .set(__tokenHeaderKey__, credentials.token)
        .send({ projectName: `test-project-000` })
        .set('Accept', 'application/json')
        .expect(201);
    });
    it('should return 400 when no projectName provided', async () => {
      await stateSetup(States.EmptyDb);
      await request(__server__)
        .post('/api/projects')
        .set(__tokenHeaderKey__, credentials.token)
        .send({})
        .set('Accept', 'application/json')
        .expect(400);
    });
    it('should not be able to create two project with same name', async () => {
      await stateSetup(States.ExistingProject);
      await request(__server__)
        .post('/api/projects')
        .set(__tokenHeaderKey__, credentials.token)
        .send({ projectName: `test-project` })
        .set('Accept', 'application/json')
        .expect(409);
    });
  });
  describe('PUT /projects/${projectName}', () => {
    it('should be able to update project', async () => {
      await stateSetup(States.ExistingProject);
      await request(__server__)
        .put('/api/projects/test-project')
        .set(__tokenHeaderKey__, credentials.token)
        .send({ projectName: `test-project` })
        .set('Accept', 'application/json')
        .expect(204);
    });
  });
  describe('DELETE /projects/${projectName}', () => {
    it('should be able to delete project', async () => {
      await stateSetup(States.ExistingProject);
      await request(__server__)
        .delete('/api/projects/test-project')
        .set(__tokenHeaderKey__, credentials.token)
        .set('Accept', 'application/json')
        .expect(204);
    });
  });
});
