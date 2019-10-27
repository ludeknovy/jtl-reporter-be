require('ts-node/register');
const { App } = require('../../../app');
const NodeEnvironment = require('jest-environment-node');

class TestEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    const app = new App();
    this.global.__server__ = require('http')
      .createServer(app.app)
      .listen('5000');
  }

  async teardown() {
    this.global.__server__.close();
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = TestEnvironment;
