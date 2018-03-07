const
	should = require('should'),
	KuzzleMock = require('../mocks/kuzzle.mock'),
	Auth = require('../../src/Auth.js');

describe('Kuzzle Auth controller', function () {
	let
		auth,
		kuzzle;

	beforeEach(() => {
		kuzzle = new KuzzleMock();
		auth = new Auth(kuzzle);
	});

	describe('#checkToken', function () {
		const token = 'fakeToken',
			expectedQuery = {
				controller: 'auth',
				action: 'checkToken'
			},
			result = {
				result: {
					valid: true,
					state: 'Error message',
					expiresAt: 42424242
				}
			};

		it('should call query with the right arguments and return Promise which resolves a boolean value', () => {
			kuzzle.queryPromise.resolves(result);

			return auth.checkToken(token)
				.then(res => {
					should(kuzzle.queryPromise).be.calledOnce();
					should(kuzzle.queryPromise).be.calledWith(expectedQuery, {body: {token: token}}, {queuable: false});
					should(res).be.exactly(result.result);
				});
		});
	});
});