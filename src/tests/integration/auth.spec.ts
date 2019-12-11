import * as request from 'supertest';
import { userSetup } from './helper/state';

describe('Auth', () => {
  let credentials;
  beforeAll(async () => {
    credentials = await userSetup();
  });
  describe('Login', () => {
    it('should be able to login with valid credentials', async () => {
      await request(__server__)
        .post('/api/auth/login')
        .send({
          username: credentials.username,
          password: credentials.password
        })
        .expect(200);
    });
    it('should not be able to login without valid credentials', async () => {
      await request(__server__)
        .post('/api/auth/login')
        .send({
          username: credentials.username,
          password: `test`
        })
        .expect(401);
    });
    it('should return 400 when invalid payload provided', async () => {
      await request(__server__)
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });
  describe('Change password', () => {
    it('should not be able to change password when unathorized', async () => {
      await request(__server__)
      .post('/api/auth/change-password')
      .send({
        currentPassword: credentials.password,
        newPassword: 'test123'
      })
      .expect(401);
    });
    it('should not be able to change password when is not long enough', async () => {
      await request(__server__)
      .post('/api/auth/change-password')
      .set('x-access-token', credentials.token)
      .send({
        currentPassword: credentials.password,
        newPassword: 'test123'
      })
      .expect(400);
    });
  });
})