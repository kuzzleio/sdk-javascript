const
  should = require('should'),
  sinon = require('sinon'),
  KuzzleMock = require('../mocks/kuzzle.mock'),
  Server = require('../../src/Server.js');

describe('Kuzzle Server Controller', () => {
  let
    server,
    kuzzle;

  beforeEach(() => {
    kuzzle = new KuzzleMock();
    server = new Server(kuzzle);
  });

  describe('#adminExists', () => {
    const expectedQuery = {
      controller: 'server',
      action: 'adminExists'
    };

    it('should call query with the right arguments and return Promise which resolves a boolean value', () => {
      kuzzle.queryPromise.resolves({result: {exists: true}})

      return server.adminExists()
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery, {}, undefined);
          should(res).be.exactly(true)
        })
        .then(() => {
          kuzzle.queryPromise.resetHistory();
          return server.adminExists({queuable: false});
        })
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).be.exactly(true)
        })
        .then(() => {
          kuzzle.queryPromise.reset();
          kuzzle.queryPromise.resolves({result: {exists: false}});
          return server.adminExists();
        })
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery);
          should(res).be.exactly(false)
        })
    });

    it('should reject the promise if receiving a response in bad format', () => {
      kuzzle.queryPromise.resolves({result: {foo: 'bar'}})
      return should(server.adminExists()).be.rejectedWith({status: 400, message: 'adminExists: bad response format'});
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.queryPromise.rejects(error);
      return should(server.adminExists()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });
});
