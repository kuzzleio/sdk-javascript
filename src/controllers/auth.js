const
  Jwt = require('../core/Jwt'),
  BaseController = require('./base'),
  User = require('./security/user');

/**
 * Auth controller
 *
 * @param kuzzle
 * @constructor
 */
class AuthController extends BaseController {

  /**
   * constructor
   * @param kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'auth');

    this._authenticationToken = null;

    // add authentication token to query
    this.kuzzle.registerPipe('kuzzle:query:before', async request => {
      this._authenticateRequest(request);

      return request;
    });
  }

  get authenticationToken () {
    return this._authenticationToken;
  }

  set authenticationToken (encodedJwt) {
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
   * a developer simply wish to verify his token
   *
   * @param {object} request
   */
  _authenticateRequest (request) {
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
   * @param {String} description - API key description
   * @param {Object} [options] - { _id, expiresIn, refresh }
   *
   * @returns {Promise.<Object>} ApiKey { _id, _source }
   */
  createApiKey(description, options = {}) {
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
   * Deletes an API key for the currently loggued user.
   *
   * @param {String} id - API key ID
   * @param {Object} [options] - { refresh }
   *
   * @returns {Promise}
   */
  deleteApiKey(id, options = {}) {
    const request = {
      action: 'deleteApiKey',
      _id: id,
      refresh: options.refresh
    };

    return this.query(request)
      .then(() => {});
  }

  /**
   * Searches API keys for the currently loggued user.
   *
   * @param {Object} [query] - Search query
   * @param {Object} [options] - { from, size }
   *
   * @returns {Promise.<object[]>} - { hits, total }
   */
  searchApiKeys(query = {}, options = {}) {
    const request = {
      action: 'searchApiKeys',
      from: options.from,
      size: options.size,
      body: query
    };

    return this.query(request)
      .then(response => response.result);
  }

  /**
   * Checks whether a given jwt token still represents a valid session in Kuzzle.
   *
   * @param  {string}   token     The jwt token to check
   * @return {Promise|*|PromiseLike<T>|Promise<T>}
   */
  checkToken (token) {
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
   * Create credentials of the specified <strategy> for the current user.
   *
   * @param credentials
   * @param strategy
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  createMyCredentials (strategy, credentials, options = {}) {
    return this.query({
      strategy,
      action: 'createMyCredentials',
      body: credentials
    }, options)
      .then(response => response.result);
  }

  /**
   * Check the existence of the specified <strategy>'s credentials for the current user.
   *
   * @param strategy
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  credentialsExist (strategy, options = {}) {
    return this.query({
      strategy,
      action: 'credentialsExist'
    }, options)
      .then(response => response.result);
  }

  /**
   * Delete credentials of the specified <strategy> for the current user.
   *
   * @param strategy
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  deleteMyCredentials (strategy, options = {}) {
    return this.query({
      strategy,
      action: 'deleteMyCredentials'
    }, options)
      .then(response => response.result.acknowledged);
  }

  /**
   * Fetches the current user.
   *
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getCurrentUser (options = {}) {
    return this.query({
      action: 'getCurrentUser'
    }, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  /**
   * Get credential information of the specified <strategy> for the current user.
   *
   * @param strategy
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getMyCredentials(strategy, options = {}) {
    return this.query({
      strategy,
      action: 'getMyCredentials'
    }, options)
      .then(response => response.result);
  }

  /**
   * Gets the rights array of the currently logged user.
   *
   * @param {object} [options] - Optional parameters
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getMyRights (options = {}) {
    return this.query({
      action: 'getMyRights'
    }, options)
      .then(response => response.result.hits);
  }

  /**
   * Get all the strategies registered in Kuzzle by all auth plugins
   *
   * @param {object} [options] - Optional parameters
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getStrategies (options = {}) {
    return this.query({
      action: 'getStrategies'
    }, options)
      .then(response => response.result);
  }

  /**
   * Send login request to kuzzle with credentials
   * If login success, store the jwt into kuzzle object
   *
   * @param strategy
   * @param credentials
   * @param expiresIn
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  login (strategy, credentials = {}, expiresIn = null) {
    const request = {
      strategy,
      expiresIn,
      body: credentials,
      action: 'login'
    };

    return this.query(request, {queuable: false})
      .then(response => {
        try {
          this._authenticationToken = new Jwt(response.result.jwt);

          this.kuzzle.emit('loginAttempt', {success: true});
        }
        catch (err) {
          return Promise.reject(err);
        }

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
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  logout () {
    return this.query({
      action: 'logout'
    }, {queuable: false})
      .then(() => {
        this._authenticationToken = null;
      });
  }

  /**
   * Update credentials of the specified <strategy> for the current user.
   *
   * @param strategy
   * @param credentals
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  updateMyCredentials (strategy, credentials, options = {}) {
    return this.query({
      strategy,
      body: credentials,
      action: 'updateMyCredentials'
    }, options)
      .then(response => response.result);
  }

  /**
   * Update current user in Kuzzle.
   *
   * @param {object} body - a plain javascript object representing the user's modification
   * @param {object} [options] - (optional) arguments
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  updateSelf (body, options = {}) {
    return this.query({
      body,
      action: 'updateSelf'
    }, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  /**
   * Validate credentials of the specified <strategy> for the current user.
   *
   * @param strategy
   * @param credentials
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  validateMyCredentials (strategy, credentials, options = {}) {
    return this.query({
      strategy,
      body: credentials,
      action: 'validateMyCredentials'
    }, options)
      .then(response => response.result);
  }

  /**
   * Refresh an authentication token
   *
   * @param {Object} options
   * @returns {Promise.<Object>}
   */
  refreshToken(options = {}) {
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

module.exports = AuthController;
