const
  ServerController = require('../../src/controllers/server'),
  sinon = require('sinon'),
  should = require('should');

describe('Server Controller', () => {
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };
    kuzzle.server = new ServerController(kuzzle);
  });

  describe('#adminExists', () => {
    const expectedQuery = {
      controller: 'server',
      action: 'adminExists'
    };

    it('should call query with the right arguments and return Promise which resolves a boolean value', () => {
      kuzzle.query.resolves({result: {exists: true}});

      return kuzzle.server.adminExists()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, undefined);
          should(res).be.a.Boolean().and.be.true();

          kuzzle.query.resetHistory();
          return kuzzle.server.adminExists({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {queuable: false});
          should(res).be.exactly(true);

          kuzzle.query.reset();
          kuzzle.query.resolves({result: {exists: false}});
          return kuzzle.server.adminExists();
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery);
          should(res).be.exactly(false);
        });
    });

    it('should reject the promise if receiving a response in bad format (missing result)', () => {
      kuzzle.query.resolves({foo: 'bar'});
      return should(kuzzle.server.adminExists()).be.rejectedWith({status: 400, message: 'adminExists: bad response format'});
    });

    it('should reject the promise if receiving a response in bad format (missing "exists" attribute)', () => {
      kuzzle.query.resolves({result: {foo: 'bar'}});
      return should(kuzzle.server.adminExists()).be.rejectedWith({status: 400, message: 'adminExists: bad response format'});
    });

    it('should reject the promise if receiving a response in bad format (bad type of "exists" attribute)', () => {
      kuzzle.query.resolves({result: {exists: 'foobar'}});
      return should(kuzzle.server.adminExists()).be.rejectedWith({status: 400, message: 'adminExists: bad response format'});
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(kuzzle.server.adminExists()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#getAllStats', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'getAllStats'
      },
      result = {
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
      };

    it('should call query with the right arguments and return Promise which resolves all the statistics frames', () => {
      kuzzle.query.resolves({result});

      return kuzzle.server.getAllStats()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, undefined);
          should(res).match(result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.getAllStats({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {queuable: false});
          should(res).match(result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(kuzzle.server.getAllStats()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#getConfig', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'getConfig'
      },
      result = {
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
      };

    it('should call query with the right arguments and return Promise which resolves the configuration', () => {
      kuzzle.query.resolves({result});

      return kuzzle.server.getConfig()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, undefined);
          should(res).match(result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.getConfig({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {queuable: false});
          should(res).match(result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(kuzzle.server.getConfig()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#getLastStats', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'getLastStats'
      },
      result = {
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
      };

    it('should call query with the right arguments and return Promise which resolves the last statistic frame', () => {
      kuzzle.query.resolves({result});

      return kuzzle.server.getLastStats()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, undefined);
          should(res).match(result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.getLastStats({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {queuable: false});
          should(res).match(result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(kuzzle.server.getLastStats()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#getStats', () => {
    const
      result = {
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
      };

    it('should call query with the right arguments and return Promise which resolves the requested statistics frames', () => {
      kuzzle.query.resolves({result});

      const expectedQuery = {
        controller: 'server',
        action: 'getStats',
        startTime: 1234,
        stopTime: 9876
      };

      return kuzzle.server.getStats(1234, 9876)
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, undefined);
          should(res).match(result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.getStats(1234, 9876, {queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {queuable: false});
          should(res).match(result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.getStats(1234, null);
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(
            {controller: 'server', action: 'getStats', startTime: 1234, stopTime: null},
            undefined
          );
          should(res).match(result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.getStats(null, 9876);
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(
            {controller: 'server', action: 'getStats', startTime: null, stopTime: 9876},
            undefined
          );
          should(res).match(result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.getStats(null, null);
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(
            {controller: 'server', action: 'getStats', startTime: null, stopTime: null},
            undefined
          );
          should(res).match(result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(kuzzle.server.getStats(1234, 9876)).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#info', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'info'
      },
      result = {
        serverInfo: {
          kuzzle: {
            api: {
              routes: {
                controller1: {
                  action1: {
                    controller: 'controller1',
                    action: 'action1',
                    http: {
                      verb: 'GET',
                      url: '/action1/url'
                    }
                  },
                  action2: {
                    controller: 'controller1',
                    action: 'action2',
                    http: {
                      verb: 'POST',
                      url: '/action2/url'
                    }
                  }
                }
              }
            }
          }
        }
      };

    it('should call query with the right arguments and return Promise which resolves the server informations', () => {
      kuzzle.query.resolves({result});

      return kuzzle.server.info()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, undefined);
          should(res).match(result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.info({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {queuable: false});
          should(res).match(result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(kuzzle.server.info()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#now', () => {
    const expectedQuery = {
      controller: 'server',
      action: 'now'
    };

    it('should call query with the right arguments and return Promise which resolves current server timestamp', () => {
      kuzzle.query.resolves({result: {now: 12345}});

      return kuzzle.server.now()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, undefined);
          should(res).be.exactly(12345);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return kuzzle.server.now({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {queuable: false});
          should(res).be.exactly(12345);
        });
    });

    it('should reject the promise if receiving a response in bad format (missing result)', () => {
      kuzzle.query.resolves({foo: 'bar'});
      return should(kuzzle.server.now()).be.rejectedWith({status: 400, message: 'now: bad response format'});
    });

    it('should reject the promise if receiving a response in bad format (missing "now" attribute)', () => {
      kuzzle.query.resolves({result: {foo: 'bar'}});
      return should(kuzzle.server.now()).be.rejectedWith({status: 400, message: 'now: bad response format'});
    });

    it('should reject the promise if receiving a response in bad format (bad type for "now" attribute)', () => {
      kuzzle.query.resolves({result: {now: 'bar'}});
      return should(kuzzle.server.now()).be.rejectedWith({status: 400, message: 'now: bad response format'});
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(kuzzle.server.now()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });
});
