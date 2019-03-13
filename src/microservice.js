const { EventEmitter } = require('events');
require('dotenv').config();

/**
 * Class used to handle microservice process plumbing.
 *
 * @author Dragos Sebestin
 */
class Microservice extends EventEmitter {

  /**
   * Class constructor.
   */
  constructor () {
    super();
  }

  /**
   * Start the instance.
   * Emits a 'started' event after the code has run.
   */
  initialize () {
    // setup process hooks to handle gracefull shutdown
    process.on('SIGINT', this.__shutdown.bind(this));
    process.on('SIGTERM', this.__shutdown.bind(this));
    process.on('SIGQUIT', this.__shutdown.bind(this));

    this.emit('started');
  }

  /**
   * Stop the instance.
   * Emits a 'stopped' event after the code has run.
   */
  __shutdown () {
    this.emit('stopped');
  }
}

module.exports = Microservice;
