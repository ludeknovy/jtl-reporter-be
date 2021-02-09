import { db } from '../../../db/db';
import { sendNotifications } from './send-notification';
const linkUrl = require('./link-url');
import axios from 'axios';
const scenarioNotifications = require('../../queries/scenario');
const msTeamsTemplate = require('./templates/ms-teams-template');


jest.mock('axios');
jest.mock('./templates/ms-teams-template');
jest.mock('../../../db/db');

const OVERVIEW = {
  percentil: 10,
  avgConnect: 1,
  avgLatency: 1,
  avgResponseTime: 1,
  duration: 1,
  endDate: new Date(),
  errorRate: 0,
  maxVu: 10,
  startDate: new Date(),
  throughput: 10
};

describe('sendNotification', () => {
  it('should call linkUrl', async () => {
    const spy = jest.spyOn(linkUrl, 'linkUrl');
    await sendNotifications('test', 'test', 'id', OVERVIEW);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it('should trigger `scenarioNotifications` query', async () => {
    const spy = jest.spyOn(scenarioNotifications, 'scenarioNotifications');
    await sendNotifications('test', 'test', 'id', OVERVIEW);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it('should not send any request if no notifications found in db', async () => {
    db.manyOrNone = jest.fn().mockImplementation(() => Promise.resolve([]));
    await sendNotifications('test', 'test', 'id', OVERVIEW);
    expect(axios).not.toHaveBeenCalled();
  });
  it('should try to send notification request when found in db', async () => {
    const spy = jest.spyOn(msTeamsTemplate, 'msTeamsTemplate');
    db.manyOrNone = jest.fn().mockImplementation(() =>
      Promise.resolve([{ url: 'test', name: 'test-name', type: 'ms-teams'}]));
    const post = axios.post = jest.fn().mockImplementation((_) => Promise.resolve({}));
    await sendNotifications('test', 'test', 'id', OVERVIEW);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledTimes(1);
  });
  it('should not throw an error when request failed', () => {
    db.manyOrNone = jest.fn().mockImplementation(() =>
      Promise.resolve([{ url: 'test', name: 'test-name', type: 'ms-teams'}]));
    const post = axios.post = jest.fn().mockImplementation((_) => Promise.reject(new Error('failed')));
    expect(async () => {
      await sendNotifications('test', 'test', 'id', OVERVIEW);
    }).not.toThrow();
  });
});
