import * as request from 'request-promise-native';
const PROVIDER_URL = 'http://localhost:5000/api';

const options = (state, consumer) => {
  return {
    url: PROVIDER_URL + '/contract/states',
    method: 'POST',
    json: true,
    body: {
      consumer,
      state
    }
  };
};

export const stateSetup = async (state, consumer = 'integration-tests') => {
  return await request(options(state, consumer));
};


export const userSetup = async () => {
  return await request({
    url: PROVIDER_URL + '/contract/test-user',
    method: 'POST',
    json: true
  });
};

export const apiTokenSetup = async () => {
  return await request({
    url: PROVIDER_URL + '/contract/api-token',
    method: 'POST',
    json: true
  });
};
