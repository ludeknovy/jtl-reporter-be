import {NextFunction, Response} from 'express';
import {db} from '../../../db/db';
import {IGetUserAuthInfoRequest} from '../../middleware/request.model';
import {loginController} from './login-controller';
import {passwordMatch, hashPassword} from './helper/passwords';

jest.mock('../../../db/db');
jest.mock('./helper/passwords');
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('loginController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthorized in case user does not exist', async function () {
    const querySpy = jest.spyOn(require('boom'), 'unauthorized');
    (db.query as any).mockResolvedValue([]);
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      body: {
        username: 'test',
        password: 'password'
      }
    };
    await loginController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should return unauthorized in case password is not correct', async function () {
    const querySpy = jest.spyOn(require('boom'), 'unauthorized');
    (db.query as any).mockResolvedValue([{password: 'test-password'}]);
    (passwordMatch as any).mockReturnValue(false);
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      body: {
        username: 'test',
        password: 'test.password'
      }
    };
    await loginController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should return toke in case password is correct', async function () {
    const tokenSpy = jest.spyOn(require('./helper/token-generator'), 'generateToken');
    (db.query as any).mockResolvedValue([{password: 'test-password'}]);
    (passwordMatch as any).mockReturnValue(true);
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      body: {
        username: 'test',
        password: 'test.password'
      }
    };
    await loginController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(response.send).toHaveBeenCalledTimes(1);
    expect(response.send).toBeCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        username: 'test'
      }));
    expect(tokenSpy).toHaveBeenCalledTimes(1);
  });

});
