const express = require('express');

const accountsRouter = require('./routers/accounts');
const integrationsRouter = require('./routers/integrations');

/**
 * Application class definition.
 *
 * @author Dragos Sebestin
 */
class App {

  /**
   * Class constructor.
   */
  constructor () {
    this.router = express.Router();
  }

  /**
   * Start running the app instance.
   */
  async start () {
    // load API routers
    this.router.use(accountsRouter());
    this.router.use(integrationsRouter());

    this.router.use(function defaultExceptionHandler (err, req, res, next) {
      try {
        let code = 500; // TODO replace with actual err code
        let exception = {}; // TODO replace with actual err payload
        res.status(code).json(exception);
      } catch (error) {
        res.status(500).end();
      }
    });
  }

  /**
   * Stop app execution.
   */
  async stop () {}
}

module.exports = App;
