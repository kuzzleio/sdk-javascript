const
  should = require('should'),
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
      kuzzle.query.resolves({result: {exists: true}});

      return server.adminExists()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res).be.exactly(true);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.adminExists({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).be.exactly(true);
        })
        .then(() => {
          kuzzle.query.reset();
          kuzzle.query.resolves({result: {exists: false}});
          return server.adminExists();
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery);
          should(res).be.exactly(false);
        });
    });

    it('should reject the promise if receiving a response in bad format (missing "exists" attribute)', () => {
      kuzzle.query.resolves({result: {foo: 'bar'}});
      return should(server.adminExists()).be.rejectedWith({status: 400, message: 'adminExists: bad response format'});
    });

    it('should reject the promise if receiving a response in bad format (bad type of "exists" attribute)', () => {
      kuzzle.query.resolves({result: {exists: 'foobar'}});
      return should(server.adminExists()).be.rejectedWith({status: 400, message: 'adminExists: bad response format'});
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
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
      };

    it('should call query with the right arguments and return Promise which resolves all the statistics frames', () => {
      kuzzle.query.resolves(response);

      return server.getAllStats()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.getAllStats({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).match(response.result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(server.getAllStats()).be.rejectedWith({status: 412, message: 'foobar error'});
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
      };

    it('should call query with the right arguments and return Promise which resolves the configuration', () => {
      kuzzle.query.resolves(response);

      return server.getConfig()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.getConfig({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).match(response.result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
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
      };

    it('should call query with the right arguments and return Promise which resolves the last statistic frame', () => {
      kuzzle.query.resolves(response);

      return server.getLastStats()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.getLastStats({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).match(response.result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(server.getLastStats()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#getStats', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'getStats'
      },
      response = {
        status: 200,
        error: null,
        action: 'getStats',
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
      };

    it('should call query with the right arguments and return Promise which resolves the requested statistics frames', () => {
      kuzzle.query.resolves(response);

      return server.getStats(1234, 9876)
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {startTime: 1234, stopTime: 9876}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.getStats(1234, 9876, {queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {startTime: 1234, stopTime: 9876}, {queuable: false});
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.getStats(1234, null);
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {startTime: 1234, stopTime: null}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.getStats(null, 9876);
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {startTime: null, stopTime: 9876}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.getStats(null, null);
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {startTime: null, stopTime: null}, undefined);
          should(res).match(response.result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(server.getStats(1234, 9876)).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#info', () => {
    const
      expectedQuery = {
        controller: 'server',
        action: 'info'
      },
      response = {
        status: 200,
        error: null,
        controller: 'server',
        action: 'info',
        requestId: 'requestId',
        result: {
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
        }
      };

    it('should call query with the right arguments and return Promise which resolves the server informations', () => {
      kuzzle.query.resolves(response);

      return server.info()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res).match(response.result);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.info({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).match(response.result);
        });
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(server.info()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });

  describe('#now', () => {
    const expectedQuery = {
      controller: 'server',
      action: 'now'
    };

    it('should call query with the right arguments and return Promise which resolves current server timestamp', () => {
      kuzzle.query.resolves({result: {now: 12345}});

      return server.now()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res).be.exactly(12345);
        })
        .then(() => {
          kuzzle.query.resetHistory();
          return server.now({queuable: false});
        })
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, {queuable: false});
          should(res).be.exactly(12345);
        });
    });

    it('should reject the promise if receiving a response in bad format (missing "now" attribute)', () => {
      kuzzle.query.resolves({result: {foo: 'bar'}});
      return should(server.now()).be.rejectedWith({status: 400, message: 'now: bad response format'});
    });

    it('should reject the promise if receiving a response in bad format (bad type for "now" attribute)', () => {
      kuzzle.query.resolves({result: {now: 'bar'}});
      return should(server.now()).be.rejectedWith({status: 400, message: 'now: bad response format'});
    });

    it('should reject the promise if an error occurs', () => {
      const error = new Error('foobar error');
      error.status = 412;
      kuzzle.query.rejects(error);
      return should(server.now()).be.rejectedWith({status: 412, message: 'foobar error'});
    });
  });
});
