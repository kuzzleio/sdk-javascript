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
	 * @param  {function} cb  The callback to be called when the response is
	 *                              available. The signature is `function(error, response)`.
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

}

module.exports = Auth;