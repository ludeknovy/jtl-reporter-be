import {db} from '../../../db/db';
import {NextFunction, Response} from 'express';
import {IGetUserAuthInfoRequest} from '../../middleware/request.model';
import {changePasswordController} from './change-password-controller';
import { passwordMatch, hashPassword  } from './helper/passwords';


jest.mock('../../../db/db');
jest.mock('./helper/passwords');
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('changePasswordController', () => {
  it('should return an error if password do not match', async function () {
    const querySpy = jest.spyOn(require('boom'), 'unauthorized');
    (passwordMatch as any).mockReturnValue(false);
    (db.query as any).mockResolvedValue([{ password: '12345' }]);

    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = { body: {
      currentPassword: 'test', newPassword: 'test'
    }, user: 'testUser'};
    await changePasswordController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith('Current password is invalid');
  });
  it('should hash and safe new password if they match', async function () {
    const querySpy = jest.spyOn(require('../../queries/auth'), 'updatePassword');
    (passwordMatch as any).mockReturnValue(true);
    (hashPassword as any).mockReturnValue('password');
    (db.query as any).mockResolvedValue([{ password: '12345' }]);

    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = { body: {
      currentPassword: 'test', newPassword: 'test'
    }, user: 'testUser'};
    await changePasswordController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(response.send).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledTimes(1);
  });
});
