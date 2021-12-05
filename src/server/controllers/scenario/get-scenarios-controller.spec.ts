import {NextFunction, Response} from 'express';
import {IGetUserAuthInfoRequest} from '../../middleware/request.model';
import {db} from '../../../db/db';
import {getScenariosController} from './get-scenarios-controller';

jest.mock('../../../db/db');
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};
describe('getScenariosController', () => {

  it('should return data if they already contain some test runs', async function () {
    (db.any as any).mockResolvedValueOnce([{name: 'scenario1', id: 'id1'}, {name: 'scenario2', id: 'id2'}]);
    (db.any as any).mockResolvedValueOnce([
      {scenario_id: 'id1', name: 'scenario1', overview: {test: 1}},
      {scenario_id: 'id1', name: 'scenario1', overview: {test: 2}},
      {scenario_id: 'id2', name: 'scenario2', overview: {test: 2}}
    ]);
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      params: 'scenario-name'
    };
    await getScenariosController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(response.send).toBeCalledWith([
      {name: 'scenario1', id: 'id1', data: [{test: 1}, { test: 2 }]},
      {name: 'scenario2', id: 'id2', data: [{test: 2}]}
    ]);
  });
  it('should return empty data if there are no test runs', async function () {
    (db.any as any).mockResolvedValueOnce([{name: 'scenario1', id: 'id1'}, {name: 'scenario2', id: 'id2'}]);
    (db.any as any).mockResolvedValueOnce([
      {scenario_id: 'id1', name: 'scenario1', overview: {test: 1}}
    ]);
    const nextFunction: NextFunction = jest.fn();
    const response = mockResponse();
    const request = {
      params: 'scenario-name'
    };
    await getScenariosController(
      request as unknown as IGetUserAuthInfoRequest,
      response as unknown as Response, nextFunction);
    expect(response.send).toBeCalledWith([
      {name: 'scenario1', id: 'id1', data: [{test: 1}]},
      {name: 'scenario2', id: 'id2', data: []}
    ]);
  });
});
