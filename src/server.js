const express = require('express');
const http = require('http');
const helmet = require('helmet');
const bodyParser = require('body-parser');
// wrap HttpServer with gracefull shutdown module
require('http-shutdown').extend();

const Microservice = require('./microservice');
const App = require('./app');

let microservice = new Microservice();
let app = undefined;
let server = undefined;
microservice.once('started', async () => {
  try {
    await bootstrap();
  } catch (error) {
    console.trace(error);
    await tearDown();
  }
});
microservice.once('stopped', async () => {
  try {
    console.log('received shutdown signal, closing server ...');
    // server.close();
    server.shutdown();
  } catch (error) {

  }
});
microservice.initialize();

/**
 * Method used to run app boostrapping code.
 */
async function bootstrap () {
  // start application logic
  app = new App();
  await app.start();

  // create HTTP infrastructure
  let expressApp = express();

  expressApp.use(helmet());
  expressApp.use(helmet.referrerPolicy());
  expressApp.use(bodyParser.json());
  expressApp.use(app.router);

  server = http.createServer(expressApp);
  server.once('close', async () => {
    try {
      await tearDown();
    } catch (error) { }
  });

  // enable gracefull shutdown on server
  server.withShutdown();
  let port = process.env.PORT;
  server.listen(port, () => {
    console.log(`magic happens on port ${port}`);
  });
}

/**
 * Method used to run app cleanup code.
 */
async function tearDown () {
  try {
    if (app) await app.stop();
  } catch (error) {

  }
}
