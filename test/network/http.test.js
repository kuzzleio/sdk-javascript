const
  proxyquire = require('proxyquire'),
  should = require('should'),
  sinon = require('sinon'),
  HttpWrapper = require('../../src/networkWrapper/protocols/http');

describe('HTTP networking module', () => {
  let network;

  beforeEach(() => {
    network = new HttpWrapper({
      host: 'address',
      port: 1234
    });
  });

  describe('#constructor', () => {
    it('should initialize http network with default routes', () => {
      should(network.http.routes).match({
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

    it('should initialize http network with custom routes', () => {
      const customNetwork = new HttpWrapper({
        host: 'address',
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

      should(customNetwork.http.routes).match({
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
      network._sendHttpRequest = sinon.stub().resolves(connectHttpResult);
    });


    it('should initialize network status and route list', () => {
      const promise = network.connect();
      should(network.state).be.eql('offline');

      return promise.then(() => {
        should(network.state).be.eql('ready');

        should(network.http.routes.foo.bar).match({verb: 'VERB', url: '/foo/bar'});
        should(network.http.routes.foo.empty).be.undefined();
        should(network.http.routes.baz).be.an.Object().and.be.empty();
      });
    });

    it('should start queuing while connecting, and then stop once the connection is ready if autoQueue option is set', () => {
      network.autoQueue = true;

      const promise = network.connect();
      should(network.queuing).be.true();

      return promise.then(() => should(network.queuing).be.false());
    });

    it('should not stop queuing when the client connection is ready if autoQueue option is not set', () => {
      network.queuing = true;
      network.autoQueue = false;

      const promise = network.connect();

      return promise.then(() => should(network.queuing).be.true());
    });

    it('should play the queue when the client connection is established if autoReplay option is set', () => {
      network.playQueue = sinon.stub();
      network.autoReplay = true;

      const promise = network.connect();

      return promise.then(() => should(network.playQueue).be.calledOnce());
    });

    it('should not play the queue when the client connection is established if autoReplay option is not set', () => {
      network.playQueue = sinon.stub();
      network.autoReplay = false;

      const promise = network.connect();

      return promise.then(() => should(network.playQueue).not.be.called());
    });
  });

  describe('#send', () => {
    beforeEach(() => {
      network._sendHttpRequest = sinon.stub().resolves();

      network.status = 'ready';
      network.http.routes = {
        foo: {bar: {verb: 'VERB', url: '/foo/bar'}}
      };
    });

    it('should send an HTTP request to the backend', () => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        index: 'index',
        collection: 'collection',
        meta: 'meta',
        body: {foo: 'bar'}
      };

      return network.send(data)
        .then(() => {
          should(network._sendHttpRequest).be.calledOnce();

          should(network._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
          should(network._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar');
          should(network._sendHttpRequest.firstCall.args[2]).match({
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
        });
    });

    it('should inject JWT header to the HTTP request', () => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        jwt: 'fake-jwt'
      };

      return network.send(data)
        .then(() => {
          should(network._sendHttpRequest).be.calledOnce();

          should(network._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
          should(network._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar');
          should(network._sendHttpRequest.firstCall.args[2]).match({
            requestId: 'requestId',
            headers: {
              authorization: 'Bearer fake-jwt'
            },
            controller: 'foo',
            action: 'bar'
          });
        });
    });

    it('should inject volatile headers to the HTTP request', () => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        volatile: {
          some: 'volatile-data'
        }
      };

      return network.send(data)
        .then(() => {
          should(network._sendHttpRequest).be.calledOnce();

          should(network._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
          should(network._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar');
          should(network._sendHttpRequest.firstCall.args[2]).match({
            requestId: 'requestId',
            headers: {
              'x-kuzzle-volatile': '{"some":"volatile-data"}'
            },
            controller: 'foo',
            action: 'bar'
          });
        });
    });

    it('should inject queryString to the HTTP request', () => {
      const data = {
        requestId: 'requestId',
        action: 'bar',
        controller: 'foo',
        foo: 'bar'
      };

      return network.send(data)
        .then(() => {
          should(network._sendHttpRequest).be.calledOnce();

          should(network._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
          should(network._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar?foo=bar');
        });
    });

    it('should inject placeholders parameters', () => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        foo: 'baz'
      };
      network.http.routes = {
        foo: {bar: {verb: 'VERB', url: '/foo/bar/:foo'}}
      };

      return network.send(data)
        .then(() => {
          should(network._sendHttpRequest).be.calledOnce();

          should(network._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
          should(network._sendHttpRequest.firstCall.args[1]).be.equal('/foo/bar/baz');
        });
    });

    it('should not send any HTTP request and emit a "No route found" event if no route is defined', () => {
      const
        eventStub = sinon.stub(),
        data = {
          requestId: 'requestId',
          controller: 'bar',
          action: 'foo'
        };

      network.addListener('requestId', eventStub);

      return network.send(data)
        .then(() => Promise.reject('No error'))
        .catch(err => {
          should(network._sendHttpRequest).not.be.called();
          should(eventStub).be.calledOnce();

          const calledArgument = eventStub.firstCall.args[0];
          should(calledArgument.status).be.equal(400);
          should(calledArgument.error.message).be.equal('No route found for bar/foo');

          should(err.message).be.equal('No route found for bar/foo');
        });
    });

    it('should emit an event with the backend response to the "requestId" listeners', () => {
      const
        eventStub = sinon.stub(),
        data = {
          requestId: 'requestId',
          controller: 'foo',
          action: 'bar'
        };

      network.addListener('requestId', eventStub);

      const result = {status: 200, backend: 'response'};
      network._sendHttpRequest.resolves(result);

      return network.send(data)
        .then(() => {
          should(network._sendHttpRequest).be.calledOnce();

          should(eventStub).be.calledOnce();
          should(eventStub.firstCall.args[0]).match({status: 200, backend: 'response'});
        });
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

      const MockHttpWrapper = proxyquire('../../src/networkWrapper/protocols/http', {
        'min-req-promise': {request: httpRequestStub}
      });

      network = new MockHttpWrapper({host: 'address', port: 1234});
    });

    it('should call http.request with empty body', () => {
      network._sendHttpRequest('VERB', '/foo/bar');

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith('http://address:1234/foo/bar', 'VERB', { body: undefined, headers: undefined });
    });

    it('should call http.request with a body', () => {
      network._sendHttpRequest('VERB', '/foo/bar', {body: 'http request body'});

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith('http://address:1234/foo/bar', 'VERB', {body: 'http request body', headers: undefined });
    });

    it('should reject the request in case of error', () => {
      httpRequestStub.rejects('My HTTP Error');

      return network._sendHttpRequest('VERB', '/foo/bar')
        .then(() => Promise.reject('No error'))
        .catch(err => {
          should(err).be.an.instanceof(Error);
          should(err.name).be.exactly('My HTTP Error');
        });
    });

    it('should resolve with the backend response', () => {
      return network._sendHttpRequest(network, 'VERB', '/foo/bar')
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
        send: sinon.stub()
      };
      // eslint-disable-next-line no-native-reassign, no-global-assign
      XMLHttpRequest = function() {
        return xhrStub;
      };

      network = new HttpWrapper({
        host: 'address',
        port: 1234
      });
    });

    afterEach(() => {
      // eslint-disable-next-line no-native-reassign, no-global-assign
      XMLHttpRequest = undefined;
    });

    it('should call XMLHttpRequest with empty body', () => {
      network._sendHttpRequest('VERB', '/foo/bar');

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('VERB', 'http://address:1234/foo/bar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith(undefined);
    });

    it('should call XMLHttpRequest with a body', () => {
      network._sendHttpRequest('VERB', '/foo/bar', {body: 'http request body'});

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('VERB', 'http://address:1234/foo/bar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith('http request body');
    });

    it('should resolve with the backend response', () => {
      const promise = network._sendHttpRequest('VERB', '/foo/bar');

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
      network.state = 'ready';
      should(network.isReady()).be.true();
    });

    it('should not be ready if the instance is offline', () => {
      network.state = 'offline';
      should(network.isReady()).be.false();
    });
  });
});
