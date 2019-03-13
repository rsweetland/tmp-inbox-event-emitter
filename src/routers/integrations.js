const express = require('express');

function IntegrationsRouter () {
  const router = Express.Router();

  router.get('/connect-ms', async () => {

  });

  /**
   * Endpoint called by the MS Graph API when requesting an authorization code.
   * Just needs a 200 status OK.
   */
  router.get('/connect-ms-callback', async (request, response) => {
    response.end();
  });

  /**
   * Route called by the MS Graph API when setting up a subscription and also
   * when receiving events.
   */
  router.post('/connect-ms-subscription-callback', async (request, response) => {
    if (request.query.validationToken) { // param passed when setting up the subscription
      return response.send(request.query.validationToken);
    }

    request.body; // TODO - do something with the event

    // if we got here, it means that we received an event
    response.status(202).end(); // API requires 202 status code
  });

  return router;
}

module.exports = IntegrationsRouter;
