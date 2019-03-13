const express = require('express');
const MSGraphAPI = require('../kernel/apis/msGraphApi');

function IntegrationsRouter () {
  const router = express.Router();
  const msGraphApi = new MSGraphAPI();

  /**
   * Helper method used to catch API errors and process token expired ones.
   * It gets a new access token using the refresh one, saves the info to the repo
   * and retries the API call.
   * @param {*} accessToken
   * @param {*} func function that returns a promise
   * @returns {Promise<any>}
   */
  const withRefreshTokenRetry = function (accessToken, func) {
    return func(accessToken).catch(async err => {
      if (err.statusCode === 401) {
        // refresh token
        let newToken = await msGraphApi.refreshAccessToken(REFRESH_TOKEN);

        // save new token info to repo

        return func(newToken.accessToken);
      } else {
        throw err;
      }
    });
  }

  router.get('/connect-ms', async (request, response, next) => {
    try {
      response.redirect(await msGraphApi.generateAuthUrl());
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
      let token = await msGraphApi.exchangeCodeForTokens(req.query.code);

      // TODO - save token to DB

      await withRefreshTokenRetry(
        token.accessToken,
        msGraphApi.addMailSubscription.bind(msGraphApi)
      );
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
