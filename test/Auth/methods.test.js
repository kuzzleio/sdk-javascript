const
	should = require('should'),
	KuzzleMock = require('../mocks/kuzzle.mock'),
	Auth = require('../../src/Auth.js'),
	User = require('../../src/security/User.js'),
	Security = require('../../src/security/Security.js');

describe.only('Kuzzle Auth controller', function () {
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

		it('should call query with the right arguments and return Promise which resolves', () => {
			kuzzle.query.resolves(result);

			return auth.checkToken(token)
				.then(res => {
					should(kuzzle.query).be.calledOnce();
					should(kuzzle.query).be.calledWith(expectedQuery, {body: {token: token}}, {queuable: false});
					should(res).be.exactly(result.result);
				});
		});
	});

	describe('#createMyCredentials', function () {
		const credentials = {foo: 'bar'},
			expectedQuery = {
				controller: 'auth',
				action: 'createMyCredentials'
			},
			result = {
				result: {
					foo: 'bar'
				}
			};

		it('should call query with the right arguments and return Promise which resolves an object', () => {
			kuzzle.query.resolves(result);

			return auth.createMyCredentials('strategy', credentials)
				.then(res => {
					should(kuzzle.query).be.calledOnce();
					should(kuzzle.query).be.calledWith(expectedQuery, {body: {foo: 'bar'}, strategy: 'strategy'}, undefined);
					should(res).be.exactly(result.result);
				});
		});
	});

	describe('#credentialsExist', function () {
		const expectedQuery = {
				controller: 'auth',
				action: 'credentialsExist'
			},
			result = {
				result: {
					acknowledged: true
				}
			};

		it('should call query with the right arguments and return Promise which resolves an object', () => {
			kuzzle.query.resolves(result);

			return auth.credentialsExist('strategy')
				.then(res => {
					should(kuzzle.query).be.calledOnce();
					should(kuzzle.query).be.calledWith(expectedQuery, {strategy: 'strategy'}, undefined);
					should(res).be.exactly(result.result);
				});
		});
	});

	describe('#deleteMyCredentials', function () {
		const expectedQuery = {
				controller: 'auth',
				action: 'deleteMyCredentials'
			},
			result = {
				result: {
					acknowledged: true
				}
			};

		it('should call query with the right arguments and return Promise which resolves an object', () => {
			kuzzle.query.resolves(result);

			return auth.deleteMyCredentials('strategy')
				.then(res => {
					should(kuzzle.query).be.calledOnce();
					should(kuzzle.query).be.calledWith(expectedQuery, {strategy: 'strategy'}, undefined);
					should(res).be.exactly(result.result);
				});
		});
	});

	describe('#getCurrentUser', function () {
		const expectedQuery = {
				controller: 'auth',
				action: 'getCurrentUser'
			},
			result = {
				result: {
					_id: 'foobar',
					_source: {
						name: {
							first: 'John',
							last: 'Doe'
						},
						profile: {
							_id: 'default',
							roles: [
								{_id: 'default'}
							]
						}
					}
				}
			};

		it('should call query with the right arguments and return Promise which resolves an object', () => {
			kuzzle.query.resolves(result);
			const userResponse = new User(new Security(kuzzle), result.result._id, result.result._source, result.result._meta);

			return auth.getCurrentUser()
				.then(res => {
					should(kuzzle.query).be.calledOnce();
					should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
					should(res.id).be.exactly(userResponse.id);
					should(res.content).be.exactly(userResponse.content);
				});
		});
	});

	describe('#getCurrentUser', function () {
		const expectedQuery = {
				controller: 'auth',
				action: 'getCurrentUser'
			},
			result = {
				result: {
					_id: 'foobar',
					_source: {
						name: {
							first: 'John',
							last: 'Doe'
						},
						profile: {
							_id: 'default',
							roles: [
								{_id: 'default'}
							]
						}
					}
				}
			};

		it('should call query with the right arguments and return Promise which resolves an object', () => {
			kuzzle.query.resolves(result);
			const userResponse = new User(new Security(kuzzle), result.result._id, result.result._source, result.result._meta);

			return auth.getCurrentUser()
				.then(res => {
					should(kuzzle.query).be.calledOnce();
					should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
					should(res.id).be.exactly(userResponse.id);
					should(res.content).be.exactly(userResponse.content);
				});
		});
	});

	describe('#getMyCredentials', function () {
		const expectedQuery = {
				controller: 'auth',
				action: 'getMyCredentials'
			},
			result = {
				result: {
					username: 'foo',
					kuid: '42'
				}
			};

		it('should call query with the right arguments and return Promise which resolves an object', () => {
			kuzzle.query.resolves(result);

			return auth.getMyCredentials('strategy')
				.then(res => {
					should(kuzzle.query).be.calledOnce();
					should(kuzzle.query).be.calledWith(expectedQuery, {strategy: 'strategy'}, undefined);
					should(res).be.exactly(result.result);
				});
		});
	});

	describe('#getMyRights', function () {
		const expectedQuery = {
				controller: 'auth',
				action: 'getMyRights'
			},
			result = {
				result: {
					hits: [
						{
							'controller': 'ctrl_name',
							'action': 'action_name',
							'index': 'index_name',
							'collection': 'collection_name',
							'value': 'allowed|denied|conditional'
						}
					]
				}
			};

		it('should call query with the right arguments and return Promise which resolves an object', () => {
			kuzzle.query.resolves(result);

			return auth.getMyRights()
				.then(res => {
					should(kuzzle.query).be.calledOnce();
					should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
					should(res).be.an.Array().and.eql(result.result.hits);
				});
		});
	});

});