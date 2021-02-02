jasmine.DEFAULT_TIMEOUT_INTERVAL = 80000;
import { Verifier } from '@pact-foundation/pact';
import { App } from '../../app';
import { States } from './states.model';
const PROVIDER_URL = 'http://localhost:5000/api';
import axios, { AxiosRequestConfig } from 'axios';
const CONSUMER = 'JTL-REPORTER-UI';
// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  let httpServer;
  beforeAll(async () => {
    const app = new App();
    httpServer = require('http').createServer(app.app);
    httpServer.listen('5000');
  });
  afterAll(() => {
    console.log('closing server');
    httpServer.close();
  });

  it(`should validate the expectations of ${CONSUMER}`, async () => {
    let opts = {
      provider: 'jtl-reporter-be',
      providerBaseUrl: PROVIDER_URL,
      pactBrokerUrl: 'https://jtl-reporter.pact.dius.com.au',
      tags: ['latest'],
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      publishVerificationResult: process.env.ENVIRONMENT === 'CI',
      providerVersion: '0.0.0',
      requestFilter: async (req, res, next) => {
        const token = await generateAuthHeaders();
        req.headers['x-access-token'] = token;
        next();
      },
      stateHandlers: {
        'there is existing project': async () => {
          await axios(options(CONSUMER, States.ExistingProject));
        },
        'there is existing project with at least one scenario': async () => {
          await axios(options(CONSUMER, States.ExistingScenario));
        },
        'there is at least one existing test item': async () => {
          await axios(options(CONSUMER, States.ExistingTestItem));
        }
      }
    };

    return new Verifier().verifyProvider(opts).then(output => {
      console.log('Pact Verification Complete!');
      console.log(output);
    });
  });
});


const options = (consumer, state): AxiosRequestConfig => {
  return {
    url: '/contract/states',
    baseURL: PROVIDER_URL,
    method: 'POST',
    data: {
      consumer,
      state
    }
  };
};


const generateAuthHeaders = async () => {
  const { data } = await axios({
    url: '/contract/test-user',
    baseURL: PROVIDER_URL,
    method: 'POST'
  });
  return data.token;
};
