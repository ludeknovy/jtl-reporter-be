import * as request from 'supertest';
import { userSetup } from './helper/state';
import { routes } from './helper/routes';

describe('Users', () => {
  let credentials;
  beforeAll(async () => {
    credentials = await userSetup();
  });
  describe('POST /users', () => {
    it('should not be able to create new user as unathorized user', async () => {
      await request(__server__)
        .post(routes.users)
        .send({
          username: `new.user`,
          password: 'test12345'
        })
        .expect(401);
    });
    it('should be able to create new user', async () => {
      const USERNAME = 'new.test.user'
      await request(__server__)
        .post(routes.users)
        .set(__tokenHeaderKey__, credentials.token)
        .send({
          username: USERNAME,
          password: 'test12345'
        })
        .expect(201);

      await request(__server__)
        .get(routes.users)
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(200)
        .then(({ body }) => {
          expect(body.find((_) => _.username === USERNAME)).toBeDefined()
        })
    });
    it.each([
      ['too short password', { password: 'test', username: 'test' }],
      ['too short username', { password: 'test12345', username: 'te' }],
      ['unallowed character é in username', { password: 'test12345', username: 'éééééé' }],
      ['unallowed character ? username', { password: 'test12345', username: 'test?' }],
      ['unallowed character @ in username', { password: 'test12345', username: 'test@' }],
    ])('should not be able to create new when %s provided', async (desc, body) => {
      await request(__server__)
        .post(routes.users)
        .set(__tokenHeaderKey__, credentials.token)
        .send(body)
        .expect(400)
  });

});
describe('GET /users', () => {
  it('should not be able to get users as unathorized user', async () => {
    await request(__server__)
      .get(routes.users)
      .send()
      .expect(401);
  });
  it('should be able to get users', async () => {
    await request(__server__)
      .get(routes.users)
      .set(__tokenHeaderKey__, credentials.token)
      .send()
      .expect(200)
  });
});
});