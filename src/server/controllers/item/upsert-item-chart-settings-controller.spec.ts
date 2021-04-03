import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';
import { upsertItemChartSettingsController } from './upsert-item-chart-settings-controller';
jest.mock('../../../db/db');
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('upsertItemChartSettingsController', () => {
  it('should save data to db', async () => {
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const querySpy = jest.spyOn(require('../../queries/items'), 'upsertItemChartSettings');
    const request = {
      params: { projectName: 'project', scenarioName: 'scenario', itemId: 'id' },
      user: { userId: 'testUser' }
    };
    await upsertItemChartSettingsController(request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(response.send).toHaveBeenCalledTimes(1);
  });
});
