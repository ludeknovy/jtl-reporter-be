import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';
import { deleteTokenController } from './delete-token-controller';
jest.mock('../../../db/db');
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('deleteTokenController', () => {
  it('should remove data', async () => {
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const querySpy = jest.spyOn(require('../../queries/api-tokens'), 'deleteToken');
    const request = {
      body: { id: 'userId' }
    };
    await deleteTokenController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(response.send).toHaveBeenCalledTimes(1);
  });
});
