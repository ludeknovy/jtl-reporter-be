import { allowQueryTokenAuth } from './allow-query-token-auth';
import { IGetUserAuthInfoRequest } from './request.model';
import { Response, NextFunction } from 'express';
import { Request } from '@pact-foundation/pact/common/request';

describe('allowQueryTokenAuth', () => {
  let nextFunction: NextFunction = jest.fn();
  const request: any = {};
  it('sets allowQueryAuth to true', async () => {
    await allowQueryTokenAuth(request as unknown as IGetUserAuthInfoRequest,
      {} as unknown as Response, nextFunction);
    expect(request.allowQueryAuth).toEqual(true);
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

});
