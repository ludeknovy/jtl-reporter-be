jasmine.DEFAULT_TIMEOUT_INTERVAL = 80000;
import { Verifier } from '@pact-foundation/pact';
import * as Server from '../../app';
import * as request from 'request-promise-native';
import { States } from './states.model';
const PROVIDER_URL = 'http://localhost:5000/api';
const CONSUMER = 'JTL-REPORTER-UI';
// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  let server;
  beforeAll(async () => {
    server = Server.default;
  });
  afterAll(async () => {
    await server.close();
  });

  it('should validate the expectations of Our Little Consumer', async () => {
    let opts = {
      provider: 'jtl-reporter-be',
      providerBaseUrl: PROVIDER_URL,
      pactBrokerUrl: 'https://jtl-reporter.pact.dius.com.au',
      tags: ['latest'],
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      publishVerificationResult: process.env.ENVIRONMENT === 'CI',
      providerVersion: '0.0.0',
      stateHandlers: {
        'there is existing project': async () => {
          await request(options(CONSUMER, States.ExistingProject));
        },
        'there is existing project with at least one scenario': async () => {
          await request(options(CONSUMER, States.ExistingScenario));
        },
        'there is at least one existing test item': async () => {
          await request(options(CONSUMER, States.ExistingTestItem));
        },
      },
    };

    return new Verifier().verifyProvider(opts).then(output => {
      console.log('Pact Verification Complete!');
      console.log(output);
    });
  });
});


const options = (consumer, state) => {
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
