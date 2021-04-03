jest.mock('../../../db/db');
import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';
import { db } from '../../../db/db';
import { getTokensController } from './get-tokens-controller';
import { getApiTokens } from '../../queries/api-tokens';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

db.many = jest.fn().mockResolvedValue([]);


it('should fetch data from db', async () => {
  const nextFunction: NextFunction = jest.fn();
  const response = mockResponse();
  const request = {};
  await getTokensController(
    request as unknown as IGetUserAuthInfoRequest,
    response as unknown as Response, nextFunction);
  expect(db.many).toHaveBeenLastCalledWith(getApiTokens);
  expect(response.send).toHaveBeenCalledTimes(1);
});
