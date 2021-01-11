import { Jwt } from '../core/Jwt';
import { BaseController } from './Base';
import { User } from '../core/security/User';
import { JSONObject, ApiKey } from '../types';

/**
 * Auth controller
 *
 * @param kuzzle
 * @constructor
 */
export class AuthController extends BaseController {
  private _authenticationToken: any | null;

  /**
   * constructor
   * @param kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'auth');

    this._authenticationToken = null;

    this.kuzzle.on('tokenExpired', () => {
      this._authenticationToken = null;
    });
  }

  /**
   *  Authentication token in use
   */
  get authenticationToken (): any | null {
    return this._authenticationToken;
  }

  set authenticationToken (encodedJwt: any) {
    if (encodedJwt === undefined || encodedJwt === null) {
      this._authenticationToken = null;
    }
    else if (typeof encodedJwt === 'string') {
      this._authenticationToken = new Jwt(encodedJwt);
    }
    else {
      throw new Error(`Invalid token argument: ${encodedJwt}`);
    }
  }

  /**
   * Do not add the token for the checkToken route, to avoid getting a token error when
   * a developer simply wishes to verify their token
   */
  authenticateRequest (request: any) {
    if ( !this.authenticationToken
      || (request.controller === 'auth'
      && (request.action === 'checkToken' || request.action === 'login'))
    ) {
      return;
    }

    request.jwt = this.authenticationToken.encodedJwt;
  }

  /**
   * Creates a new API key for the currently loggued user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/create-api-key
   *
   * @param description API key description
   * @param options Additional options
   *    - `_id` API key unique ID
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `expiresIn` Expiration duration
   *
   * @returns The created API key
   */
  createApiKey(
    description: string,
    options: { _id?: string, expiresIn?: number, refresh?: 'wait_for' } = {}
  ): Promise<ApiKey> {
    const request = {
      action: 'createApiKey',
      _id: options._id,
      expiresIn: options.expiresIn,
      refresh: options.refresh,
      body: {
        description
      }
    };

    return this.query(request)
      .then(response => response.result);
  }

  /**
   * Checks if an API action can be executed by the current user
   * 
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/check-rights
   * @param requestPayload Request to check
   */
  checkRights (
    requestPayload: JSONObject
  ): Promise<boolean> {

    const request = {
      body: requestPayload,
      action: 'checkRights'
    };
    return this.query(request)
      .then(response => response.result.allowed);
  }

  /**
   * Deletes an API key for the currently loggued user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/delete-api-key
   *
   * @param id API key ID
   * @param options Additional options
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   */
  deleteApiKey(id: string, options: { refresh?: 'wait_for' } = {}): Promise<null> {
    const request = {
      action: 'deleteApiKey',
      _id: id,
      refresh: options.refresh
    };

    return this.query(request)
      .then(() => null);
  }

  /**
   * Searches API keys for the currently loggued user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/search-api-keys
   *
   * @param query Search query
   * @param options Additional options
   *    - `from` Offset of the first document to fetch
   *    - `size` Maximum number of documents to retrieve per page
   *
   * @returns A search result object
   */
  searchApiKeys(
    query: JSONObject = {},
    options: { from?: number, size?: number, lang?: string } = {}
  ): Promise<{
    /**
     * Array of found ApiKeys
     */
    hits: Array<ApiKey>,
    /**
     * Total number of API keys found
     */
    total: number
  }> {
    const request = {
      action: 'searchApiKeys',
      from: options.from,
      size: options.size,
      lang: options.lang,
      body: query
    };

    return this.query(request)
      .then(response => response.result);
  }

  /**
   * Checks whether a given jwt token still represents a valid session in Kuzzle.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/check-token
   *
   * @param token The jwt token to check (default to current SDK token)
   *
   * @returns A token validity object
   */
  checkToken (token?: string): Promise<{
    /**
     * Tell if the token is valid or not
     */
    valid: boolean,
    /**
     * Explain why the token is invalid
     */
    state: string,
    /**
     * Token expiration timestamp
     */
    expiresAt: number
  }> {
    if (token === undefined && this.authenticationToken) {
      token = this.authenticationToken.encodedJwt;
    }

    return this.query({
      action: 'checkToken',
      body: { token }
    }, { queuable: false })
      .then(response => response.result);
  }

  /**
   * Create credentials of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/create-my-credentials
   *
   * @param strategy New credentials
   * @param credentials Name of the strategy to use
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns An object representing the new credentials.
   *    The content depends on the authentication strategy
   */
  createMyCredentials (
    strategy: string,
    credentials: JSONObject,
    options: { queuable?: boolean } = {}
  ): Promise<JSONObject> {
    return this.query({
      strategy,
      action: 'createMyCredentials',
      body: credentials
    }, options)
      .then(response => response.result);
  }

  /**
   * Check the existence of the specified strategy's credentials for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/credentials-exist
   *
   * @param strategy Name of the strategy to use
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns A boolean indicating if the credentials exists
   */
  credentialsExist (
    strategy: string,
    options: { queuable?: boolean } = {}
  ): Promise<boolean> {
    return this.query({
      strategy,
      action: 'credentialsExist'
    }, options)
      .then(response => response.result);
  }

  /**
   * Delete credentials of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/delete-my-credentials
   *
   * @param strategy Name of the strategy to use
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   */
  deleteMyCredentials (
    strategy: string,
    options: { queuable?: boolean } = {}
  ): Promise<boolean> {
    return this.query({
      strategy,
      action: 'deleteMyCredentials'
    }, options)
      .then(response => response.result.acknowledged);
  }

  /**
   * Fetches the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/get-current-user
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns Currently loggued User
   */
  getCurrentUser (options: { queuable?: boolean } = {}): Promise<User> {
    return this.query({
      action: 'getCurrentUser'
    }, options)
      .then(response => new User(
        this.kuzzle,
        response.result._id,
        response.result._source));
  }

  /**
   * Get credential information of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/get-my-credentials
   *
   * @param strategy Name of the strategy to use
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns An object representing the credentials for the provided authentication strategy.
   *    Its content depends on the authentication strategy.
   */
  getMyCredentials(
    strategy: string,
    options: { queuable?: boolean } = {}
  ): Promise<JSONObject> {
    return this.query({
      strategy,
      action: 'getMyCredentials'
    }, options)
      .then(response => response.result);
  }

  /**
   * Gets the rights array of the currently logged user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/get-my-rights
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns An array containing user rights objects
   */
  getMyRights (
    options: { queuable?: boolean } = {}
  ): Promise<Array<{
    /**
     * Controller on wich the rights are applied
     */
    controller: string,
    /**
     * Action on wich the rights are applied
     */
    action: string,
    /**
     * Index on wich the rights are applied
     */
    index: string,
    /**
     * Collection on wich the rights are applied
     */
    collection: string,
    /**
     * Rights ("allowed" or "denied")
     */
    value: string
  }>> {
    return this.query({
      action: 'getMyRights'
    }, options)
      .then(response => response.result.hits);
  }

  /**
   * Get all the strategies registered in Kuzzle by all auth plugins
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/get-strategies
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns An array of available strategies names
   */
  getStrategies (options: { queuable?: boolean } = {}): Promise<Array<string>> {
    return this.query({
      action: 'getStrategies'
    }, options)
      .then(response => response.result);
  }

  /**
   * Send login request to kuzzle with credentials
   * If login success, store the jwt into kuzzle object
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/login
   *
   * @param strategy Name of the strategy to use
   * @param credentials Credentials object for the strategy
   * @param expiresIn Expiration time in ms library format. (e.g. "2h")
   *
   * @returns The encrypted JSON Web Token
   */
  login (
    strategy: string,
    credentials: JSONObject,
    expiresIn?: string|number
  ): Promise<string> {
    const request = {
      strategy,
      expiresIn,
      body: credentials,
      action: 'login'
    };

    return this.query(request, {queuable: false, verb: 'POST'})
      .then(response => {
        this._authenticationToken = new Jwt(response.result.jwt);

        this.kuzzle.emit('loginAttempt', {success: true});

        return response.result.jwt;
      })
      .catch(err => {
        this.kuzzle.emit('loginAttempt', {success: false, error: err.message});
        throw err;
      });
  }

  /**
   * Send logout request to kuzzle with jwt.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/logout
   */
  logout (): Promise<void> {
    return this.query({
      action: 'logout'
    }, { queuable: false })
      .then(() => {
        this._authenticationToken = null;
      });
  }

  /**
   * Update credentials of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/update-my-credentials
   *
   * @param strategy Name of the strategy to use
   * @param credentials Updated credentials
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns An object representing the updated credentials.
   *    The content depends on the authentication strategy
   */
  updateMyCredentials (
    strategy: string,
    credentials: JSONObject,
    options: { queuable?: boolean } = {}
  ): Promise<JSONObject> {
    return this.query({
      strategy,
      body: credentials,
      action: 'updateMyCredentials'
    }, options)
      .then(response => response.result);
  }

  /**
   * Update current user in Kuzzle.
   * This route cannot update the list of associated security profiles.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/update-self
   *
   * @param {object} content - User custom information
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns Currently loggued User
   */
  updateSelf (
    content: JSONObject,
    options: { queuable?: boolean } = {}
  ): Promise<User> {
    return this.query({
      body: content,
      action: 'updateSelf'
    }, options)
      .then(response => new User(
        this.kuzzle,
        response.result._id,
        response.result._source));
  }

  /**
   * Validate credentials of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/validate-my-credentials
   *
   * @param strategy Name of the strategy to use
   * @param credentials Credentials to validate
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   */
  validateMyCredentials (
    strategy: string,
    credentials: JSONObject,
    options: { queuable?: boolean } = {}
  ): Promise<boolean> {
    return this.query({
      strategy,
      body: credentials,
      action: 'validateMyCredentials'
    }, options)
      .then(response => response.result);
  }

  /**
   * Refresh the SDK current authentication token
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/refresh-token
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `expiresIn` Expiration duration
   *
   * @returns The refreshed token
   */
  refreshToken(
    options: { queuable?: boolean, expiresIn?: number|string } = {}
  ): Promise<{
    /**
     * Token unique ID
     */
    _id: string;
    /**
     * Expiration date in Epoch-millis format (-1 if the token never expires)
     */
    expiresAt: number;
    /**
     * Authentication token associated with this API key
     */
    jwt: string;
    /**
     * Original TTL in ms
     */
    ttl: number;
  }> {
    const query = {
      action: 'refreshToken',
      expiresIn: options.expiresIn
    };

    return this.query(query, options)
      .then(response => {
        this._authenticationToken = new Jwt(response.result.jwt);

        return response.result;
      });
  }
}
