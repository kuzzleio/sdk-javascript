const
  proxyquire = require('proxyquire'),
  should = require('should'),
  sinon = require('sinon'),
  HttpWrapper = require('../../src/protocols/http');

describe('HTTP networking module', () => {
  let protocol;

  beforeEach(() => {
    protocol = new HttpWrapper('address', {
      port: 1234
    });
  });

  describe('#constructor', () => {
    it('should expose an unique identifier', () => {
      should(protocol.id).be.a.String();
    });

    it('should initialize http protocol with default routes', () => {
      should(protocol.http.routes).match({
        auth: {
          login: {
            verb: 'POST',
            url: '/_login/:strategy'
          }
        },
        bulk: {
          import: {
            verb: 'POST',
            url: '/:index/:collection/_bulk'
          }
        },
        document: {
          create: {
            verb: 'POST',
            url: '/:index/:collection/_create'
          }
        },
        security: {
          createFirstAdmin: {
            verb: 'POST',
            url: '/_createFirstAdmin'
          },
          createRestrictedUser: {
            verb: 'POST',
            url: '/users/_createRestricted'
          },
          createUser: {
            verb: 'POST',
            url: '/users/_create'
          }
        }
      });
    });

    it('should initialize http protocol with custom routes', () => {
      const customProtocol = new HttpWrapper('address', {
        port: 1234,
        http: {
          customRoutes: {
            foo: {
              bar: {verb: 'VERB', url: '/foo/bar'}
            },
            document: {
              create: {verb: 'VERB', url: '/:index/:collection/_custom/_create'}
            }
          }
        }
      });

      should(customProtocol.http.routes).match({
        document: {
          create: {
            verb: 'VERB',
            url: '/:index/:collection/_custom/_create'
          }
        },
        foo: {
          bar: {
            verb: 'VERB',
            url: '/foo/bar'
          }
        }
      });
    });
  });

  describe('#connect', () => {
    const connectHttpResult = {
      result: {
        serverInfo: {
          kuzzle: {
            api: {
              routes: {
                foo: {
                  bar: {
                    http: [{verb: 'VERB', url: '/foo/bar'}]
                  },
                  empty: {
                    http: []
                  }
                },
                baz: {}
              }
            }
          }
        }
      }
    };

    beforeEach(() => {
      protocol._sendHttpRequest = sinon.stub().resolves(connectHttpResult);
    });


    it('should initialize protocol status and route list', () => {
      const promise = protocol.connect();
      should(protocol.state).be.eql('offline');

      return promise.then(() => {
        should(protocol.state).be.eql('ready');

        should(protocol.http.routes.foo.bar).match({verb: 'VERB', url: '/foo/bar'});
        should(protocol.http.routes.foo.empty).be.undefined();
      });
    });

    it('should not stop queuing when the client connection is ready if autoQueue option is not set', () => {
      protocol.queuing = true;
      protocol.autoQueue = false;

      const promise = protocol.connect();

      return promise.then(() => should(protocol.queuing).be.true());
    });

    it('should not play the queue when the client connection is established if autoReplay option is not set', () => {
      protocol.playQueue = sinon.stub();
      protocol.autoReplay = false;

      const promise = protocol.connect();

      return promise.then(() => should(protocol.playQueue).not.be.called());
    });

    it('should emit a networkError on failure', () => {
      const error = new Error('test');
      const eventStub = sinon.stub();

      protocol._sendHttpRequest.rejects(error);

      protocol.addListener('networkError', eventStub);

      return protocol.connect()
        .then(() => {
          throw new Error('no error');
        })
        .catch(err => {
          should(err).eql(error);

          should(eventStub)
            .be.calledOnce();
          const emittedError = eventStub.firstCall.args[0];

          should(emittedError.internal)
            .eql(error);
          should(emittedError.message)
            .startWith('Unable to connect to kuzzle server at');

        });
    });
  });

  describe('#send', () => {
    beforeEach(() => {
      protocol._sendHttpRequest = sinon.stub().resolves();

      protocol.status = 'ready';
      protocol.http.routes = {
        foo: {bar: {verb: 'VERB', url: '/foo/bar'}}
      };
    });

    it('should send an HTTP request to the backend', done => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        index: 'index',
        collection: 'collection',
        meta: 'meta',
        body: {foo: 'bar'}
      };

      protocol.on('requestId', () => {
        should(protocol._sendHttpRequest).be.calledOnce();

        should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
        should(protocol._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar');
        should(protocol._sendHttpRequest.firstCall.args[2]).match({
          requestId: 'requestId',
          headers: {
            'Content-Type': 'application/json'
          },
          controller: 'foo',
          action: 'bar',
          index: 'index',
          collection: 'collection',
          meta: 'meta',
          body: JSON.stringify({foo: 'bar'})
        });

        done();
      });

      protocol.send(data);
    });

    it('should inject JWT header to the HTTP request', done => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        jwt: 'fake-jwt'
      };

      protocol.on('requestId', () => {
        should(protocol._sendHttpRequest).be.calledOnce();

        should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
        should(protocol._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar');
        should(protocol._sendHttpRequest.firstCall.args[2]).match({
          requestId: 'requestId',
          headers: {
            authorization: 'Bearer fake-jwt'
          },
          controller: 'foo',
          action: 'bar'
        });

        done();
      });

      protocol.send(data);
    });

    it('should inject volatile headers to the HTTP request', done => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        volatile: {
          some: 'volatile-data'
        }
      };

      protocol.on('requestId', () => {
        should(protocol._sendHttpRequest).be.calledOnce();

        should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
        should(protocol._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar');
        should(protocol._sendHttpRequest.firstCall.args[2]).match({
          requestId: 'requestId',
          headers: {
            'x-kuzzle-volatile': '{"some":"volatile-data"}'
          },
          controller: 'foo',
          action: 'bar'
        });

        done();
      });

      protocol.send(data);
    });

    it('should inject queryString to the HTTP request', done => {
      const data = {
        requestId: 'requestId',
        action: 'bar',
        controller: 'foo',
        foo: 'bar'
      };

      protocol.on('requestId', () => {
        should(protocol._sendHttpRequest).be.calledOnce();

        should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
        should(protocol._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar?foo=bar');

        done();
      });

      protocol.send(data);
    });

    it('should inject placeholders parameters', done => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        foo: 'baz'
      };
      protocol.http.routes = {
        foo: {bar: {verb: 'VERB', url: '/foo/bar/:foo'}}
      };

      protocol.on('requestId', () => {
        should(protocol._sendHttpRequest).be.calledOnce();

        should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
        should(protocol._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar/baz');

        done();
      });

      protocol.send(data);
    });

    it('should not send any HTTP request and emit a "No route found" event if no route is defined', done => {
      const data = {
        requestId: 'requestId',
        controller: 'bar',
        action: 'foo'
      };

      protocol.on('requestId', ({ status, error }) => {
        should(protocol._sendHttpRequest).not.be.called();

        should(status).be.equal(400);
        should(error.message).be.equal('No route found for bar/foo');

        done();
      });

      protocol.send(data);
    });

    it('should emit an event with the backend response to the "requestId" listeners', done => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar'
      };

      const result = {status: 200, backend: 'response'};
      protocol._sendHttpRequest.resolves(result);

      protocol.on('requestId', response => {
        should(protocol._sendHttpRequest).be.calledOnce();

        should(response).match({status: 200, backend: 'response'});

        done();
      });

      protocol.send(data);
    });

    it('should not add null or undefined arguments to the query args', done => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        _id: null,
        toto: undefined
      };

      protocol.on('requestId', () => {
        try {
          should(protocol._sendHttpRequest).be.calledOnce();
          should(protocol._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar');
          should(protocol._sendHttpRequest.firstCall.args[2]).match({
            requestId: 'requestId',
            controller: 'foo',
            action: 'bar'
          });

          done();
        } catch (error) {
          done(error);
        }
      });

      protocol.send(data);
    });

  });

  describe('#sendHttpRequest NodeJS', () => {
    const
      mockResponseBody = {
        status: 200,
        result: 'Kuzzle Result'
      };

    let httpRequestStub;

    beforeEach(() => {
      httpRequestStub = sinon.stub().resolves({body: JSON.stringify(mockResponseBody)});

      const MockHttpWrapper = proxyquire('../../src/protocols/http', {
        'min-req-promise': {request: httpRequestStub}
      });

      protocol = new MockHttpWrapper('address', { port: 1234 });
    });

    it('should call http.request with empty body', () => {
      protocol._sendHttpRequest('VERB', '/foo/bar');

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith('http://address:1234/foo/bar', 'VERB', { body: undefined, headers: {'Content-Length': 0} });
    });

    it('should call http.request with a body', () => {
      const body = 'http request body';
      protocol._sendHttpRequest('VERB', '/foo/bar', {body});

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith('http://address:1234/foo/bar', 'VERB', {body: 'http request body', headers: {'Content-Length': body.length}});
    });

    it('should call http.request with a body and some headers', () => {
      const body = 'http request body';
      protocol._sendHttpRequest('VERB', '/foo/bar', {body, headers: {foo: 'bar'}});

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith('http://address:1234/foo/bar', 'VERB', {
        body: 'http request body',
        headers: {'Content-Length': body.length, foo: 'bar'}
      });
    });

    it('should reject the request in case of error', () => {
      httpRequestStub.rejects('My HTTP Error');

      return protocol._sendHttpRequest('VERB', '/foo/bar')
        .then(() => Promise.reject('No error'))
        .catch(err => {
          should(err).be.an.instanceof(Error);
          should(err.name).be.exactly('My HTTP Error');
        });
    });

    it('should resolve with the backend response', () => {
      return protocol._sendHttpRequest(protocol, 'VERB', '/foo/bar')
        .then(res => {
          should(res).be.an.Object();
          should(res.status).be.equal(mockResponseBody.status);
          should(res.result).be.equal(mockResponseBody.result);
        });
    });
  });

  /**
   * @global XMLHttpRequest
   */
  describe('#sendHttpRequest XMLHttpRequest', () => {
    let xhrStub;

    beforeEach(() => {
      xhrStub = {
        open: sinon.stub(),
        send: sinon.stub(),
        setRequestHeader: sinon.stub()
      };
      // eslint-disable-next-line no-native-reassign, no-global-assign
      XMLHttpRequest = function() {
        return xhrStub;
      };

      protocol = new HttpWrapper('address', {
        port: 1234
      });
    });

    afterEach(() => {
      // eslint-disable-next-line no-native-reassign, no-global-assign
      XMLHttpRequest = undefined;
    });

    it('should call XMLHttpRequest with empty body', () => {
      protocol._sendHttpRequest('VERB', '/foo/bar');

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('VERB', 'http://address:1234/foo/bar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith(undefined);

      should(xhrStub.setRequestHeader).not.be.called();
    });

    it('should call XMLHttpRequest with a body', () => {
      const body = 'http request body';
      protocol._sendHttpRequest('VERB', '/foo/bar', {body});

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('VERB', 'http://address:1234/foo/bar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith('http request body');

      should(xhrStub.setRequestHeader).not.be.called();
    });

    it('should call XMLHttpRequest with a body and some headers', () => {
      const body = 'http request body';
      protocol._sendHttpRequest('VERB', '/foo/bar', {body, headers: {foo: 'bar'}});

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('VERB', 'http://address:1234/foo/bar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith('http request body');

      should(xhrStub.setRequestHeader).be.calledOnce();
      should(xhrStub.setRequestHeader).be.calledWith('foo', 'bar');
    });

    it('should resolve with the backend response', () => {
      const promise = protocol._sendHttpRequest('VERB', '/foo/bar');

      xhrStub.responseText = '{"status": 200, "result": "Kuzzle Result"}';
      xhrStub.onload();

      return promise
        .then(res => {
          should(res).be.an.Object();
          should(res.status).be.exactly(200);
          should(res.result).be.exactly('Kuzzle Result');
        });
    });
  });

  describe('#isReady', () => {
    it('should be ready if the instance is ready', () => {
      protocol.state = 'ready';
      should(protocol.isReady()).be.true();
    });

    it('should not be ready if the instance is offline', () => {
      protocol.state = 'offline';
      should(protocol.isReady()).be.false();
    });
  });
});
