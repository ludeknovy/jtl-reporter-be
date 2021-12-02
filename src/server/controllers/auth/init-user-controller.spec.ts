import {NextFunction, Response} from 'express';
import {db} from '../../../db/db';
import {initUserController} from './init-user-controller';
import {IGetUserAuthInfoRequest} from '../../middleware/request.model';

jest.mock('../../../db/db');
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('initUserController', () => {
  it('should call createNewUserController if no user exists', async function () {
    const querySpy = jest.spyOn(require('../users/create-new-user-controller'), 'createNewUserController');
    (db.manyOrNone as any).mockResolvedValue([]);
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {};
    await initUserController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(querySpy).toHaveBeenCalledTimes(1);
  });
});
