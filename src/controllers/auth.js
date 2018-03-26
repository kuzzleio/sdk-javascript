const User = require('./security/user');

const _kuzzle = Symbol();

/**
 * Auth controller
 *
 * @param kuzzle
 * @constructor
 */
class AuthController {

  /**
   * constructor
   * @param kuzzle
   */
  constructor (kuzzle) {
    this[_kuzzle] = kuzzle;
  }

  get kuzzle () {
    return this[_kuzzle];
  }

  /**
   * Checks whether a given jwt token still represents a valid session in Kuzzle.
   *
   * @param  {string}   token     The jwt token to check
   * @return {Promise|*|PromiseLike<T>|Promise<T>}
   */
  checkToken (token) {
    return this.kuzzle.query({
      controller: 'auth',
      action: 'checkToken',
      body: {token}
    }, {queuable: false});
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
    return this.kuzzle.query({
      strategy,
      controller: 'auth',
      action: 'createMyCredentials',
      body: credentials
    }, options);
  }

  /**
   * Check the existence of the specified <strategy>'s credentials for the current user.
   *
   * @param strategy
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  credentialsExist (strategy, options = {}) {
    return this.kuzzle.query({
      strategy,
      controller: 'auth',
      action: 'credentialsExist'
    }, options);
  }

  /**
   * Delete credentials of the specified <strategy> for the current user.
   *
   * @param strategy
   * @param options
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  deleteMyCredentials (strategy, options = {}) {
    return this.kuzzle.query({
      strategy,
      controller: 'auth',
      action: 'deleteMyCredentials'
    }, options);
  }

  /**
   * Fetches the current user.
   *
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getCurrentUser (options = {}) {
    return this.kuzzle.query({
      controller: 'auth',
      action: 'getCurrentUser'
    }, options)
      .then(result => {
        const user = new User(this.kuzzle);
        user.id = result.id;
        user.content = result._source;
        user.meta = result._meta;

        return user;
      });
  }

  /**
   * Get credential information of the specified <strategy> for the current user.
   *
   * @param strategy
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getMyCredentials(strategy, options = {}) {
    return this.kuzzle.query({
      strategy,
      controller: 'auth',
      action: 'getMyCredentials'
    }, options);
  }

  /**
   * Gets the rights array of the currently logged user.
   *
   * @param {object} [options] - Optional parameters
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getMyRights (options = {}) {
    return this.kuzzle.query({
      controller: 'auth',
      action: 'getMyRights'
    }, options)
      .then(res => res.hits);
  }

  /**
   * Get all the strategies registered in Kuzzle by all auth plugins
   *
   * @param {object} [options] - Optional parameters
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  getStrategies (options = {}) {
    return this.kuzzle.query({
      controller: 'auth',
      action: 'getStrategies'
    }, options);
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
  login (strategy, credentials, expiresIn) {
    if (typeof strategy !== 'string' || strategy === '') {
      return Promise.reject(new Error('auth.login: strategy required'));
    }

    const
      request = {
        strategy,
        expiresIn,
        body: credentials || {},
        controller: 'auth',
        action: 'login'
      };

    return this.kuzzle.query(request, {queuable: false})
      .then(result => {
        try {
          this.kuzzle.jwt = result.jwt;
          this.kuzzle.emit('loginAttempt', {success: true});
        }
        catch (err) {
          return Promise.reject(err);
        }
        return result.jwt;
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
    return this.kuzzle.query({
      controller: 'auth',
      action: 'logout'
    }, {queuable: false})
      .then(() => {
        this.kuzzle.jwt = undefined;
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
    return this.kuzzle.query({
      strategy,
      body: credentials,
      controller: 'auth',
      action: 'updateMyCredentials'
    }, options);
  }

  /**
   * Update current user in Kuzzle.
   *
   * @param {object} body - a plain javascript object representing the user's modification
   * @param {object} [options] - (optional) arguments
   * @returns {Promise|*|PromiseLike<T>|Promise<T>}
   */
  updateSelf (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'auth',
      action: 'updateSelf'
    }, options);
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
    return this.kuzzle.query({
      strategy,
      body: credentials,
      controller: 'auth',
      action: 'validateMyCredentials'
    }, options);
  }

}

module.exports = AuthController;
