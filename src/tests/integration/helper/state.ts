import { AxiosRequestConfig } from 'axios';
const axios = require('axios');

const PROVIDER_URL = 'http://localhost:5000';

const options = (state, consumer): AxiosRequestConfig => {
  return {
    url: '/api/contract/states',
    baseURL: PROVIDER_URL,
    method: 'POST',
    data: {
      consumer,
      state
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

export const stateSetup = async (state, consumer = 'integration-tests') => {
  return await axios(options(state, consumer));
};


export const userSetup = async () => {
  return await axios({
    url: '/api/contract/test-user',
    baseURL: PROVIDER_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const apiTokenSetup = async () => {
  return await axios({
    url: '/api/contract/api-token',
    baseURL: PROVIDER_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
