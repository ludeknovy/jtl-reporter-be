// require('ts-node/register');
const { App } = require("../../../app")
const NodeEnvironment = require('jest-environment-node').TestEnvironment

const app = new App()


class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context)
    console.log("TADAA==========")
  }
  async setup() {
    await super.setup()


    // @ts-ignore
    this.global.__tokenHeaderKey__ = "x-access-token"
    // @ts-ignore
    this.global.__server__ = app.listen()
  }

  async teardown() {
    await app.close()
    await super.teardown()
  }

  runScript(script) {
    return super.runScript(script)
  }
}

module.exports = TestEnvironment
