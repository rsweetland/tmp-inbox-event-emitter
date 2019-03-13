const MicrosoftGraphClient = require('@microsoft/microsoft-graph-client').Client;
const OAuth2 = require('simple-oauth2');

const graphScopes = ['offline_access', 'user.read', 'mail.read'];
const oauthCredentials = {
  client: {
    id: process.env.MS365_CLIENT_ID,
    secret: process.env.MS365_CLIENT_SECRET
  },
  auth: {
    tokenHost: process.env.MS365_HOST,
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};

/**
 * Wrapper around the MS Graph API
 *
 * @reference https://docs.microsoft.com/en-us/graph/auth-v2-user
 * @author Dragos Sebestin
 */
class MSGraphApi {

  /**
   * Class constructor.
   */
  constructor () {
    this.oauth = OAuth2.create(oauthCredentials);
    this.client = MicrosoftGraph.init({
      authProvider: (callback) => { // TODO - move provider to a separate class
        callback(null, ACCESS_TOKEN);
      }
    });
  }

  /**
   * Generate URL to begin OAuth flow.
   * @returns {Promise<string>}
   */
  generateAuthUrl () {
    return this.oauth.authorizationCode.authorizeURL({
      redirect_uri: process.env.MS365_REDIRECT_URI,
      scope: graphScopes.join(' ') // MS Graph API requires scopes to be separated by space :-/
    });
  }

  /**
   * Exchange authorization code for a tokens.
   * @param {string} code - authorization code
   * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number}>}
   */
  exchangeCodeForTokens (code) {
    const tokenConfig = {
      code,
      redirect_uri: process.env.MS365_REDIRECT_URI,
      scope: graphScopes.join(' ')
    };
    const result = await this.oauth.authorizationCode.getToken(tokenConfig);
    let tokenData = await this.oauth.accessToken.create(result);
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    };
  }

  /**
   * Add a new webhook for mail events.
   * @returns {Promise<ISubscription>}
   */
  async addMailSubscription () {
    await this.client.api('/subscriptions').post({
      changeType: 'created,updated',
      notificationUrl: process.env.MS365_SUBSCRIPTION_CALLBACK_URI,
      resource: "me/mailFolders('Inbox')/messages",
      expirationDateTime: new Date('2019-03-14')
    });
  }

  /**
   * Remove a webhook by subscription id.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async removeMailSubscription (id) {
    await this.client.api(`/subscriptions/${id}`).delete();
  }

  /**
   * Fetch email message by id.
   * @param {id} string
   */
  async fetchEmailMessage (path) {
    return this.client.api(path).get();
  }
}

module.exports = MSGraphApi;
