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

  describe('#getAllStats', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'getAllStats'
      },
      response = {
        status: 200,
        error: null,
        action: 'getAllStats',
        controller: 'server',
        requestId: 'requestId',
        result: {
          total: 25,
          hits: [
            {
              completedRequests: {
                websocket: 148,
                http: 24,
                mqtt: 78
              },
              failedRequests: {
                websocket: 3
              },
              ongoingRequests: {
                mqtt: 8,
                http: 2
              },
              connections: {
                websocket: 13
              },
              timestamp: 1453110641308
            }
          ]
        }
      }

    it('should call query with the right arguments and return Promise which resolves all the statistics frames', () => {
      kuzzle.queryPromise.resolves(response);

      return server.getAllStats()
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery, {}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.queryPromise.resetHistory();
          return server.getAllStats({queuable: false});
        })
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).match(response.result);
        })
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.queryPromise.rejects(error);
      return should(server.adminExists()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#getConfig', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'getConfig'
      },
      response = {
        status: 200,
        error: null,
        action: 'getConfig',
        controller: 'server',
        requestId: 'requestId',
        result: {
          stats: {
            ttl: 3600,
            statsInterval: 10
          },
          validation: {},
          dump: {
            enabled: false,
            path: './dump/',
            gcore: 'gcore',
            dateFormat: 'YYYYMMDD-HHmm',
            handledErrors: {
              enabled: true,
              whitelist: ['RangeError','TypeError','KuzzleError','InternalError']
            }
          },
          version: '<current kuzzle version>'
        }
      }

    it('should call query with the right arguments and return Promise which resolves the configuration', () => {
      kuzzle.queryPromise.resolves(response);

      return server.getConfig()
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery, {}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.queryPromise.resetHistory();
          return server.getConfig({queuable: false});
        })
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).match(response.result);
        })
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.queryPromise.rejects(error);
      return should(server.getConfig()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#getLastStats', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'getLastStats'
      },
      response = {
        status: 200,
        error: null,
        action: 'getLastStats',
        controller: 'server',
        requestId: 'requestId',
        result: {
          completedRequests: {
            websocket: 148,
            http: 24,
            mqtt: 78
          },
          failedRequests: {
            websocket: 3
          },
          ongoingRequests: {
            mqtt: 8,
            http: 2
          },
          connections: {
            websocket: 13
          },
          timestamp: 1453110641308
        }
      }

    it('should call query with the right arguments and return Promise which resolves the last statistic frame', () => {
      kuzzle.queryPromise.resolves(response);

      return server.getLastStats()
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery, {}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.queryPromise.resetHistory();
          return server.getLastStats({queuable: false});
        })
        .then(res => {
          should(kuzzle.queryPromise).be.calledOnce();
          should(kuzzle.queryPromise).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).match(response.result);
        })
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.queryPromise.rejects(error);
      return should(server.adminExists()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });
});
