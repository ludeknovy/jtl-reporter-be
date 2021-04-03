import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';
import { createTokenController } from './create-token-controller';
jest.mock('../../../db/db');
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('createTokenController', () => {
  it('should save data to db', async () => {
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const querySpy = jest.spyOn(require('../../queries/api-tokens'), 'createNewApiToken');
    const request = {
      user: { userId: 'testUserId' },
      body: { description: 'token description' }
    };
    await createTokenController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(response.send).toHaveBeenCalledTimes(1);
  });
});
