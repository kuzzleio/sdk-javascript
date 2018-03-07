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
	 * @returns {Kuzzle}
	 */
	createMyCredentials (strategy, credentials, options) {
		return this.kuzzle.queryPromise({controller: 'auth', action: 'createMyCredentials'}, {strategy, body: credentials}, options)
			.then(res => res.result);
	}


}

module.exports = Auth;