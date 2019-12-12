import * as request from 'supertest';
import { userSetup } from './helper/state';
import { routes } from './helper/routes';

describe('Api tokens', () => {
  let credentials;
  beforeAll(async () => {
    credentials = await userSetup();
  });
  describe('POST /api-tokens', () => {
    it('should not be able to create new api token as unathorized user', async () => {
      await request(__server__)
        .post(routes.apiTokens)
        .send({
          description: `new-api-token`
        })
        .expect(401);
    });
    it('should not be able to create token when no description provided', async () => {
      await request(__server__)
        .post(routes.apiTokens)
        .set(__tokenHeaderKey__, credentials.token)
        .send({
          description: null
        })
        .expect(400);
    });
  });
  it('should be able to create new api token', async () => {
    await request(__server__)
      .post(routes.apiTokens)
      .set(__tokenHeaderKey__, credentials.token)
      .send({
        description: 'new-api-token'
      })
      .expect(201);
    await request(__server__)
      .get(routes.apiTokens)
      .set(__tokenHeaderKey__, credentials.token)
      .send()
      .then(({ body }) => {
        expect(body.length).toEqual(1);
      });
  });

  describe('GET /api-tokens', () => {
    it('should not be able to get api tokens as unathorized user', async () => {
      await request(__server__)
        .get(routes.apiTokens)
        .send()
        .expect(401);
    });
    it('should be able to get api tokens', async () => {
      await request(__server__)
        .get(routes.apiTokens)
        .set(__tokenHeaderKey__, credentials.token)
        .send()
        .expect(200);
    });
  });
  describe('DELETE /api-tokens', () => {
    let tokenId;
    beforeAll(async () => {
      await request(__server__)
      .get(routes.apiTokens)
      .set(__tokenHeaderKey__, credentials.token)
      .send()
      .expect(200)
      .then(({ body }) => {
        tokenId = body[0].id;
      })
    });
    it('should not be able to delete api token as uanthorized user', async () => { 
      await request(__server__)
      .delete(routes.apiTokens)
      .send()
      .expect(401);
    });
    it('should be able to delete api token', async () => {
      await request(__server__)
      .delete(routes.apiTokens)
      .set(__tokenHeaderKey__, credentials.token)
      .send({ id: tokenId })
      .expect(204);
     });
     it('should return 400 when no token id provided', async () => {
      await request(__server__)
      .delete(routes.apiTokens)
      .set(__tokenHeaderKey__, credentials.token)
      .send({ id: null })
      .expect(400);
     })
  });
});