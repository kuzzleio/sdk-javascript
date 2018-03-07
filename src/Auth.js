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

		return this.kuzzle.queryPromise({controller: 'auth', action: 'checkToken'}, request, {queuable: false})
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
		return this.kuzzle.queryPromise({controller: 'auth', action: 'createMyCredentials'}, {strategy, body: credentials}, options)
			.then(res => res.result);
	}

	/**
	 * Check the existence of the specified <strategy>'s credentials for the current user.
	 *
	 * @param strategy
	 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
	 */
	credentialsExist (strategy, options) {
		return this.kuzzle.queryPromise({controller: 'auth', action: 'credentialsExist'}, {strategy}, options)
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
		return this.kuzzle.queryPromise({controller: 'auth', action: 'deleteMyCredentials'}, {strategy}, options)
			.then(res => res.result);
	}


}

module.exports = Auth;