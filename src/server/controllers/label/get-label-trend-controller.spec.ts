import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';
import { getLabelTrendController } from './get-label-trend-controller';
import { db } from '../../../db/db';

jest.mock('../../../db/db');
jest.mock('../../../db/db');

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('getItemChartSettingsController', () => {
  it('should fetch getLabelHistoryForVu from db', async () => {
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const querySpy = jest.spyOn(require('../../queries/items'), 'getLabelHistoryForVu');
    const request = {
      params: { projectName: 'project', scenarioName: 'scenario', itemId: 'id' },
      query: { virtualUsers: '10' }
    };
    (db.query as any).mockResolvedValue([]);
    await getLabelTrendController(request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(response.send).toHaveBeenCalledTimes(1);
  });
  it('should fetch getLabelHistory from db', async () => {
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const querySpy = jest.spyOn(require('../../queries/items'), 'getLabelHistory');
    const request = {
      params: { projectName: 'project', scenarioName: 'scenario', itemId: 'id', label: 'test-label' },
      query: { virtualUsers: '0' }
    };
    (db.query as any).mockResolvedValue([]);

    await getLabelTrendController(request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(response.send).toHaveBeenCalledTimes(1);
  });
  it('should sort query output from oldest to newest', async () => {
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      params: { projectName: 'project', scenarioName: 'scenario', itemId: 'id', label: 'test-label' },
      query: { virtualUsers: '0' }
    };
    (db.query as any).mockResolvedValue([{
      labels: {
        n0: 10,
        n5: 20,
        n9: 70,
        label: 'http://localhost:4200/',
        samples: 57945,
        errorRate: 10,
        throughput: 25860.48,
        statusCodes: [],
        bytesPerSecond: 6675715.08,
        avgResponseTime: 1,
        maxResponseTime: 182,
        minResponseTime: 0,
        bytesSentPerSecond: 0,
        responseMessageFailures: []
      },
      item_id: '102312c6-710c-4f93-ab5f-cfebcb690921',
      start_time: new Date('2021-12-30T21:25:57'),
      max_vu: 8
    },
    {
      labels: {
        n0: 1,
        n5: 2,
        n9: 7,
        label: 'http://localhost:4200/',
        samples: 57945,
        errorRate: 100,
        throughput: 2586.48,
        statusCodes: [],
        bytesPerSecond: 6675715.08,
        avgResponseTime: 1,
        maxResponseTime: 182,
        minResponseTime: 0,
        bytesSentPerSecond: 0,
        responseMessageFailures: []
      },
      item_id: '305f602f-db7d-442d-8e13-a8b00d278a41',
      start_time: new Date('2021-12-10T21:25:57'),
      max_vu: 8
    }
    ]);

    await getLabelTrendController(request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(response.send).toHaveBeenCalledWith({
      errorRate: [100, 10],
      n0: [1, 10],
      n5: [2, 20],
      n9: [7, 70],
      threads: [8, 8],
      throughput: [ 2586.48,  25860.48],
      timePoints: ['10.12.2021 21:25:00', '30.12.2021 21:25:00']
    });
  });
});
