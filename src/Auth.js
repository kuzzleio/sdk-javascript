const User = require('./security/User.js')

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
			.then(res => res.result)
	}

	/**
	 * Create credentials of the specified <strategy> for the current user.
	 *
	 * @param credentials
	 * @param strategy
	 * @param options
	 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
	 */
	createMyCredentials (strategy, credentials, options) {
		return this.kuzzle.query({controller: 'auth', action: 'createMyCredentials'}, {strategy, body: credentials}, options)
			.then(res => res.result);
	}

	/**
	 * Check the existence of the specified <strategy>'s credentials for the current user.
	 *
	 * @param strategy
	 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
	 */
	credentialsExist (strategy, options) {
		return this.kuzzle.query({controller: 'auth', action: 'credentialsExist'}, {strategy}, options)
			.then(res => res.result)
	}

	/**
	 * Delete credentials of the specified <strategy> for the current user.
	 *
	 * @param strategy
	 * @param options
	 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
	 */
	deleteMyCredentials (strategy, options) {
		return this.kuzzle.query({controller: 'auth', action: 'deleteMyCredentials'}, {strategy}, options)
			.then(res => res.result);
	}

	/**
	 * Fetches the current user.
	 *
	 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
	 */
	getCurrentUser () {
		return this.kuzzle.query({controller: 'auth', action: 'getCurrentUser'}, {}, undefined)
			.then(res => {
				return new User(this.kuzzle.security, res.result._id, res.result._source, res.result._meta)
			})
	}

	/**
	 * Get credential information of the specified <strategy> for the current user.
	 *
	 * @param strategy
	 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
	 */
	getMyCredentials (strategy, options) {
		return this.kuzzle.query({controller: 'auth', action: 'getMyCredentials'}, {strategy}, options)
			.then(res => res.result);
	}

	/**
	 * Gets the rights array of the currently logged user.
	 *
	 * @param {object} [options] - Optional parameters
	 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
	 */
	getMyRights (options) {
		return this.kuzzle.query({controller: 'auth', action:'getMyRights'}, {}, options)
			.then(res => res.result.hits)
	}

	/**
	 * Get all the strategies registered in Kuzzle by all auth plugins
	 *
	 * @param {object} [options] - Optional parameters
	 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
	 */
	getStrategies (options) {
		return this.kuzzle.query({controller: 'auth', action:'getStrategies'}, {}, options)
			.then(res => res.result)
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
	login (strategy, ...args) {
		if (!strategy || typeof strategy !== 'string') {
			return Promise.reject(new Error('Auth.login: strategy required'));
		}

		const
			request = {
				strategy,
				body: {}
			};

		// Handle arguments (credentials, expiresIn)
		if (args[0]) {
			if (typeof args[0] === 'object') {
				request.body = args[0];
			} else if (typeof args[0] === 'number' || typeof args[0] === 'string') {
				request.expiresIn = args[0];
			}
		}
		if (args[1]) {
			if (typeof args[1] === 'number' || typeof args[1] === 'string') {
				request.expiresIn = args[1];
			}
		}

		return this.kuzzle.query({controller: 'auth', action: 'login'}, request, {queuable: false})
			.then(response => {
				this.kuzzle.setJwt(response.result.jwt);
				return response.result.jwt;
			})
			.catch(err => {
				this.kuzzle.emit('loginAttempt', {success: false, error: err.message});
				return new Error(err);
			});
	}

}

module.exports = Auth;