const
  mockrequire = require('mock-require'),
  rewire = require('rewire'),
  should = require('should'),
  sinon = require('sinon'),
  HttpWrapper = rewire('../../src/networkWrapper/protocols/http');

describe('HTTP networking module', () => {
  let network;

  beforeEach(() => {
    network = new HttpWrapper('address', {
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
      const customNetwork = new HttpWrapper('address', {
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

    let
      reset,
      sendHttpRequestStub;

    beforeEach(() => {
      sendHttpRequestStub = sinon.stub();

      reset = HttpWrapper.__set__({
        sendHttpRequest: sendHttpRequestStub
      });
    });

    afterEach(() => {
      reset();
    });

    it('should initialize network status and route list', () => {
      network.connect();
      should(network.state).be.eql('offline');

      sendHttpRequestStub.yield(null, connectHttpResult);
      should(network.state).be.eql('ready');

      should(network.http.routes.foo.bar).match({verb: 'VERB', url: '/foo/bar'});
      should(network.http.routes.foo.empty).be.undefined();
      should(network.http.routes.baz).be.an.Object().and.be.empty();
    });

    it('should start queuing while connecting, and then stop once the connection is ready if autoQueue option is set', () => {
      network.autoQueue = true;

      network.connect();
      should(network.queuing).be.true();

      sendHttpRequestStub.yield(null, connectHttpResult);
      should(network.queuing).be.false();
    });

    it('should not stop queuing when the client connection is ready if autoQueue option is not set', () => {
      network.queuing = true;
      network.autoQueue = false;

      network.connect();

      sendHttpRequestStub.yield(null, connectHttpResult);
      should(network.queuing).be.true();
    });

    it('should play the queue when the client connection is established if autoReplay option is set', () => {
      network.playQueue = sinon.stub();
      network.autoReplay = true;

      network.connect();

      sendHttpRequestStub.yield(null, connectHttpResult);
      should(network.playQueue).be.calledOnce();
    });

    it('should not play the queue when the client connection is established if autoReplay option is not set', () => {
      network.playQueue = sinon.stub();
      network.autoReplay = false;

      network.connect();

      sendHttpRequestStub.yield(null, connectHttpResult);
      should(network.playQueue).not.be.called();
    });
  });

  describe('#send', () => {
    let
      sendHttpRequestStub,
      reset;

    beforeEach(() => {
      sendHttpRequestStub = sinon.stub();

      reset = HttpWrapper.__set__({
        sendHttpRequest: sendHttpRequestStub
      });

      network.status = 'ready';
      network.http.routes = {
        foo: {bar: {verb: 'VERB', url: '/foo/bar'}}
      };
    });

    afterEach(() => {
      reset();
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

      network.send(data);
      should(sendHttpRequestStub).be.calledOnce();

      should(sendHttpRequestStub.firstCall.args[1]).be.equal('VERB');
      should(sendHttpRequestStub.firstCall.args[2]).be.equal('/foo/bar');
      should(sendHttpRequestStub.firstCall.args[3]).match({
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

    it('should inject JWT header to the HTTP request', () => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        jwt: 'fake-jwt'
      };

      network.send(data);
      should(sendHttpRequestStub).be.calledOnce();

      should(sendHttpRequestStub.firstCall.args[1]).be.equal('VERB');
      should(sendHttpRequestStub.firstCall.args[2]).be.equal('/foo/bar');
      should(sendHttpRequestStub.firstCall.args[3]).match({
        requestId: 'requestId',
        headers: {
          authorization: 'Bearer fake-jwt'
        },
        controller: 'foo',
        action: 'bar'
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

      network.send(data);
      should(sendHttpRequestStub).be.calledOnce();

      should(sendHttpRequestStub.firstCall.args[1]).be.equal('VERB');
      should(sendHttpRequestStub.firstCall.args[2]).be.equal('/foo/bar');
      should(sendHttpRequestStub.firstCall.args[3]).match({
        requestId: 'requestId',
        headers: {
          'x-kuzzle-volatile': '{"some":"volatile-data"}'
        },
        controller: 'foo',
        action: 'bar'
      });
    });

    it('should inject queryString to the HTTP request', () => {
      const data = {
        requestId: 'requestId',
        action: 'bar',
        controller: 'foo',
        foo: 'bar'
      };

      network.send(data);
      should(sendHttpRequestStub).be.calledOnce();

      should(sendHttpRequestStub.firstCall.args[1]).be.equal('VERB');
      should(sendHttpRequestStub.firstCall.args[2]).be.equal('/foo/bar?foo=bar');
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

      network.send(data);
      should(sendHttpRequestStub).be.calledOnce();

      should(sendHttpRequestStub.firstCall.args[1]).be.equal('VERB');
      should(sendHttpRequestStub.firstCall.args[2]).be.equal('/foo/bar/baz');
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

      network.send(data);
      should(sendHttpRequestStub).not.be.called();
      should(eventStub).be.calledOnce();
      const calledArgument = eventStub.firstCall.args[0];
      should(calledArgument.status).be.equal(400);
      should(calledArgument.error.message).be.equal('No route found for bar/foo');
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

      network.send(data);
      should(sendHttpRequestStub).be.calledOnce();

      const result = {status: 200, backend: 'response'};

      sendHttpRequestStub.yield(null, result);

      should(eventStub).be.calledOnce();
      should(eventStub.firstCall.args[0]).match({status: 200, backend: 'response'});
    });
  });

  describe('#sendHttpRequest NodeJS', () => {
    const
      emitEvent = (mock, evt, ...payload) => {
        for (const cb of mock._events[evt]) {
          cb(...payload);
        }
      },
      listenEvent = (mock, evt, cb) => {
        if (mock._events[evt] === undefined) {
          mock._events[evt] = [];
        }
        if (typeof cb === 'function') {
          mock._events[evt].push(cb);
        }
      };

    let
      reqCB,
      MockHttpWrapper,
      requestMock,
      responseMock,
      httpRequestStub,
      sendHttpRequest;

    beforeEach(() => {
      MockHttpWrapper = rewire('../../src/networkWrapper/protocols/http');
      sendHttpRequest = MockHttpWrapper.__get__('sendHttpRequest');

      requestMock = {
        _events: {},
        emit: (evt, ...payload) => emitEvent(requestMock, evt, ...payload),
        on: (evt, cb) => listenEvent(requestMock, evt, cb),
        write: sinon.stub(),
        end: sinon.stub()
      };
      httpRequestStub = sinon.stub().returns(requestMock);

      responseMock = {
        _events: {},
        emit: (evt, ...payload) => emitEvent(responseMock, evt, ...payload),
        on: (evt, cb) => listenEvent(responseMock, evt, cb),
      };

      mockrequire('http', {request: httpRequestStub});
      MockHttpWrapper = mockrequire.reRequire('../../src/networkWrapper/protocols/http');

      network = new MockHttpWrapper('address', {
        port: 1234
      });

      reqCB = sinon.stub();
    });

    afterEach(() => {
      mockrequire.stopAll();
    });

    it('should call http.request with empty body', () => {
      const options = {
        protocol: 'http:',
        host: 'address',
        port: 1234,
        method: 'VERB',
        path: '/foo/bar'
      };

      sendHttpRequest(network, 'VERB', '/foo/bar', reqCB);
      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWithMatch(options);

      should(requestMock.write).be.calledOnce();
      should(requestMock.write).be.calledWith('');

      should(requestMock.end).be.calledOnce();
    });

    it('should call http.request with a body', () => {
      const options = {
        protocol: 'http:',
        host: 'address',
        port: 1234,
        method: 'VERB',
        path: '/foo/bar'
      };

      sendHttpRequest(network, 'VERB', '/foo/bar', {body: 'http request body'}, reqCB);
      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWithMatch(options);

      should(requestMock.write).be.calledOnce();
      should(requestMock.write).be.calledWith('http request body');

      should(requestMock.end).be.calledOnce();
    });

    it('should call the callback with the error in case of error', () => {
      sendHttpRequest(network, 'VERB', '/foo/bar', reqCB);

      should(reqCB).not.be.called();
      requestMock.emit('error', 'My HTTP Error');
      should(reqCB).be.calledOnce();
      should(reqCB).be.calledWith('My HTTP Error');
    });

    it('should call the callback with the backend response', () => {
      const
        response = {
          status: 200,
          result: 'Kuzzle Result'
        };

      sendHttpRequest(network, 'VERB', '/foo/bar', reqCB);

      should(reqCB).not.be.called();

      const resCB = httpRequestStub.firstCall.args[1];

      resCB(responseMock);
      responseMock.emit('data', JSON.stringify(response));
      responseMock.emit('end');

      should(reqCB).be.calledOnce();
      should(reqCB).be.calledWith(null, response);
    });
  });

  /**
   * @global XMLHttpRequest
   */
  describe('#sendHttpRequest XMLHttpRequest', () => {
    let
      xhrStub,
      reqCB,
      sendHttpRequest;

    beforeEach(() => {
      xhrStub = {
        open: sinon.stub(),
        send: sinon.stub()
      };
      // eslint-disable-next-line no-native-reassign, no-global-assign
      XMLHttpRequest = function() {
        return xhrStub;
      };

      sendHttpRequest = HttpWrapper.__get__('sendHttpRequest');
      network = new HttpWrapper('address', {
        port: 1234
      });

      reqCB = sinon.stub();
    });

    afterEach(() => {
      // eslint-disable-next-line no-native-reassign, no-global-assign
      XMLHttpRequest = undefined;

      mockrequire.stopAll();
    });

    it('should call XMLHttpRequest with empty body', () => {
      sendHttpRequest(network, 'VERB', '/foo/bar', reqCB);

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('VERB', 'http://address:1234/foo/bar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith(undefined);
    });

    it('should call XMLHttpRequest with a body', () => {
      sendHttpRequest(network, 'VERB', '/foo/bar', {body: 'http request body'}, reqCB);

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('VERB', 'http://address:1234/foo/bar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith('http request body');
    });

    it('should call the callback with the backend response', () => {
      const
        response = {
          status: 200,
          result: 'Kuzzle Result'
        };

      sendHttpRequest(network, 'VERB', '/foo/bar', reqCB);

      should(reqCB).not.be.called();

      xhrStub.responseText = JSON.stringify(response);

      xhrStub.onload();

      should(reqCB).be.calledOnce();
      should(reqCB).be.calledWith(null, response);
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
