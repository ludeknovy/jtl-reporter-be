require('ts-node/register');
const { App } = require('../../../app');
const NodeEnvironment = require('jest-environment-node');

let socketMap = {};
let lastSocketKey = 0;


class TestEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }
  async setup() {
    await super.setup();
    const app = new App();

    this.global.__tokenHeaderKey__ = 'x-access-token';
    this.global.__server__ = require('http')
      .createServer(app.app)
      .listen('5000');
    this.global.__server__.on('connection', function (socket) {
      /* generate a new, unique socket-key */
      const socketKey = ++lastSocketKey;
      /* add socket when it is connected */
      socketMap[socketKey] = socket;
      socket.on('close', function () {
        /* remove socket when it is closed */
        delete socketMap[socketKey];
      });
    });
  }

  async teardown() {
    this.global.__server__.close(function () { console.log('Server closed!'); })

    Object.keys(socketMap).forEach(function (socketKey) {
      socketMap[socketKey].destroy();
    });

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = TestEnvironment;
