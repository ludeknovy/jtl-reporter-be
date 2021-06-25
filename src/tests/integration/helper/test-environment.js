require('ts-node/register');
const { App } = require('../../../app');
const NodeEnvironment = require('jest-environment-node');

const app = new App();


class TestEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }
  async setup() {
    await super.setup();


    this.global.__tokenHeaderKey__ = 'x-access-token';
    this.global.__server__ = await app.listen();
  }

  async teardown() {
    await app.close();
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = TestEnvironment;
