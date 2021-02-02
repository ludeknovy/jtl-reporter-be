import * as request from 'supertest';
import { userSetup } from './helper/state';
import { routes } from './helper/routes';

describe('Auth', () => {
  let credentials;
  beforeAll(async () => {
    ({ data: credentials } = await userSetup());
  });
  describe('Login', () => {
    it('should be able to login with valid credentials', async () => {
      await request(__server__)
        .post(routes.auth.login)
        .send({
          username: credentials.username,
          password: credentials.password
        })
        .expect(200);
    });
    it('should not be able to login without valid credentials', async () => {
      await request(__server__)
        .post(routes.auth.login)
        .send({
          username: credentials.username,
          password: 'test'
        })
        .expect(401);
    });
    it('should return 400 when invalid payload provided', async () => {
      await request(__server__)
        .post(routes.auth.login)
        .send({})
        .expect(400);
    });
  });
  describe('Change password', () => {
    it('should not be able to change password when unathorized', async () => {
      await request(__server__)
        .post(routes.auth.changePassword)
        .send({
          currentPassword: credentials.password,
          newPassword: 'test123'
        })
        .expect(401);
    });
    it('should not be able to change password when is not long enough', async () => {
      await request(__server__)
        .post(routes.auth.changePassword)
        .set(__tokenHeaderKey__, credentials.token)
        .send({
          currentPassword: credentials.password,
          newPassword: 'test123'
        })
        .expect(400);
    });
    describe('Change password flow', () => {
      const newPassword = 'test12345';
      it('should be able to change password', async () => {
        await request(__server__)
          .post(routes.auth.changePassword)
          .set(__tokenHeaderKey__, credentials.token)
          .send({
            currentPassword: credentials.password,
            newPassword
          })
          .expect(204);
      });
      it('should not be able log in with old password', async () => {
        await request(__server__)
          .post(routes.auth.login)
          .send({
            username: credentials.username,
            password: credentials.password
          })
          .expect(401);
      });
      it('should be be able to log in with new password', async () => {
        await request(__server__)
          .post(routes.auth.login)
          .send({
            username: credentials.username,
            password: newPassword
          })
          .expect(200);
      });
    });
  });
});
