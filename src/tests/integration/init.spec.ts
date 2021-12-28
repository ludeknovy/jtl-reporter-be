import { routes } from './helper/routes';
import { stateSetup, userSetup } from './helper/state';
import * as request from 'supertest';
import { States } from '../contract/states.model';

describe('init', () => {
  it('should return true when user created', async () => {
    await userSetup();
    await request(__server__)
      .get(routes.init)
      .send()
      .expect(200, { initialized: true });
  });
  it('should return false when no user created', async () => {
    await stateSetup(States.NoUsers);
    await request(__server__)
      .get(routes.init)
      .send()
      .expect(200, { initialized: false });
  });
});
