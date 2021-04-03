jest.mock('../../../db/db');
jest.mock('./helper/passwords');
import { db } from '../../../db/db';
import { Response, NextFunction, Request } from 'express';
import { loginController } from './login-controller';
import * as boom from 'boom';
import { passwordMatch } from './helper/passwords';



const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('loginController', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should not be able to login if passwords do not match', async () => {
    db.query = jest.fn().mockResolvedValue([{ password: 'abcd' }]);
    (passwordMatch as any).mockResolvedValue(false);
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      body: { username: 'user', password: 'password' }
    };
    await loginController(request as unknown as Request,
      response as unknown as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(boom.unauthorized('The credentials you provided is incorrect'));
  });
  it('should not be able to login if user does not exists', async () => {
    db.query = jest.fn().mockResolvedValue([]);
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      body: { username: 'user', password: 'password' }
    };
    await loginController(request as unknown as Request,
      response as unknown as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(boom.unauthorized('The credentials you provided is incorrect'));
  });
  it('should generate token when valid credentials provided', async () => {
    db.query = jest.fn().mockResolvedValue([{ password: 'abcd' }]);
    (passwordMatch as any).mockResolvedValue(true);
    const generateTokenSpy = jest.spyOn(require('./helper/token-generator'), 'generateToken');
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      body: { username: 'user', password: 'password' }
    };
    await loginController(request as unknown as Request,
      response as unknown as Response, nextFunction);
    expect(generateTokenSpy).toHaveBeenCalledTimes(1);
  });
});
