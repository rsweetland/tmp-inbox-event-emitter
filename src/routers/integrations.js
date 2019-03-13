const express = require('express');
const MSGraphAPI = require('../kernel/apis/msGraphApi');

function IntegrationsRouter () {
  const router = Express.Router();
  const msGraphApi = new MSGraphAPI();

  router.get('/connect-ms', async (request, response, next) => {
    try {
      response.end();
    } catch (error) {
      next(error);
    }
  });

  /**
   * Endpoint called by the MS Graph API when requesting an authorization code.
   * Just needs a 200 status OK.
   */
  router.get('/connect-ms-callback', async (request, response, next) => {
    try {
      response.redirect(await msGraphApi.generateAuthUrl());
    } catch (error) {
      next(error);
    }
  });

  /**
   * Route called by the MS Graph API when setting up a subscription and also
   * when receiving events.
   */
  router.post('/connect-ms-subscription-callback', async (request, response, next) => {
    try {
      if (request.query.validationToken) { // param passed when setting up the subscription
        return response.send(request.query.validationToken);
      }

      request.body; // TODO - do something with the event

      // if we got here, it means that we received an event
      response.status(202).end(); // API requires 202 status code
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = IntegrationsRouter;
