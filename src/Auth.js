const User = require('./security/User.js');

/**
 * Auth controller
 *
 * @param kuzzle
 * @constructor
 */
class Auth {

  /**
   * constructor
   * @param kuzzle
   */
  constructor(kuzzle) {
    Object.defineProperty(this, 'kuzzle', {
      value: kuzzle
    });
  }

  /**
   * Checks whether a given jwt token still represents a valid session in Kuzzle.
   *
   * @param  {string}   token     The jwt token to check
   * @return {Promise|*|PromiseLike<T>|Promise<T>}
   */
  checkToken(token) {
    const
      request = {
        body: {
          token
        }
      };

    return this.kuzzle.query({controller: 'auth', action: 'checkToken'}, request, {queuable: false})
      .then(res => res.result);
  }

  /**
   * Create credentials of the specified <strategy> for the current user.
   *
   * @param credentials
   * @param strategy
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  createMyCredentials(strategy, credentials, options) {
    return this.kuzzle.query({controller: 'auth', action: 'createMyCredentials'}, {
      strategy,
      body: credentials
    }, options)
      .then(res => res.result);
  }

  /**
   * Check the existence of the specified <strategy>'s credentials for the current user.
   *
   * @param strategy
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  credentialsExist(strategy, options) {
    return this.kuzzle.query({controller: 'auth', action: 'credentialsExist'}, {strategy}, options)
      .then(res => res.result);
  }

  /**
   * Delete credentials of the specified <strategy> for the current user.
   *
   * @param strategy
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  deleteMyCredentials(strategy, options) {
    return this.kuzzle.query({controller: 'auth', action: 'deleteMyCredentials'}, {strategy}, options)
      .then(res => res.result);
  }

  /**
   * Fetches the current user.
   *
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getCurrentUser() {
    return this.kuzzle.query({controller: 'auth', action: 'getCurrentUser'}, {}, undefined)
      .then(res => {
        return new User(this.kuzzle.security, res.result._id, res.result._source, res.result._meta);
      });
  }

  /**
   * Get credential information of the specified <strategy> for the current user.
   *
   * @param strategy
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getMyCredentials(strategy, options) {
    return this.kuzzle.query({controller: 'auth', action: 'getMyCredentials'}, {strategy}, options)
      .then(res => res.result);
  }

  /**
   * Gets the rights array of the currently logged user.
   *
   * @param {object} [options] - Optional parameters
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getMyRights(options) {
    return this.kuzzle.query({controller: 'auth', action: 'getMyRights'}, {}, options)
      .then(res => res.result.hits);
  }

  /**
   * Get all the strategies registered in Kuzzle by all auth plugins
   *
   * @param {object} [options] - Optional parameters
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getStrategies(options) {
    return this.kuzzle.query({controller: 'auth', action: 'getStrategies'}, {}, options)
      .then(res => res.result);
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
  login(strategy, credentials, expiresIn) {
    if (!strategy || typeof strategy !== 'string') {
      return Promise.reject(new Error('Auth.login: strategy required'));
    }

    const
      request = {
        strategy,
        body: {}
      };

    request.body = credentials || {};
    if (expiresIn) {
      request.expiresIn = expiresIn;
    }

    return this.kuzzle.query({controller: 'auth', action: 'login'}, request, {queuable: false})
      .then(response => {
        try {
          this.kuzzle.setJwt(response.result.jwt);
          this.kuzzle.emit('loginAttempt', {success: true});
        } catch (err) {
          return Promise.reject(err);
        }
        return response.result.jwt;
      })
      .catch(err => {
        this.kuzzle.emit('loginAttempt', {success: false, error: err.message});
        return new Error(err);
      });
  }

  /**
   * Send logout request to kuzzle with jwt.
   *
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  logout() {
    return this.kuzzle.query({controller: 'auth', action: 'logout'}, {}, {queuable: false})
      .then(() => this.kuzzle.unsetJwt());
  }

  /**
   * Update credentials of the specified <strategy> for the current user.
   *
   * @param strategy
   * @param credentals
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  updateMyCredentials(strategy, credentials, options) {
    return this.kuzzle.query({controller: 'auth', action: 'updateMyCredentials'}, {
      strategy,
      body: credentials
    }, options)
      .then(res => res.result);
  }

  /**
   * Update current user in Kuzzle.
   *
   * @param {object} content - a plain javascript object representing the user's modification
   * @param {object} [options] - (optional) arguments
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  updateSelf(content, options) {
    return this.kuzzle.query({controller: 'auth', action: 'updateSelf'}, {body: content}, options)
      .then(res => res.result);
  }

  /**
   * Validate credentials of the specified <strategy> for the current user.
   *
   * @param strategy
   * @param credentials
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  validateMyCredentials(strategy, credentials, options) {
    return this.kuzzle.query({controller: 'auth', action: 'validateMyCredentials'}, {
      strategy,
      body: credentials
    }, options)
      .then(res => res.result);
  }

}

module.exports = Auth;