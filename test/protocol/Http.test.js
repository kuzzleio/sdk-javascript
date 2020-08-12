const proxyquire = require('proxyquire');
const should = require('should');
const sinon = require('sinon');

const staticHttpRoutes = require('../../src/protocols/routes.json');
const { default: Http } = require('../../src/protocols/Http');

describe('HTTP networking module', () => {
  let protocol;

  beforeEach(() => {
    protocol = new Http('address', {
      port: 1234
    });
  });

  describe('#constructor', () => {
    it('should expose an unique identifier', () => {
      should(protocol.id).be.a.String();
    });
  });

  describe('#connect', () => {
    const serverPublicApiResult = {
      foo: {
        bar: {
          http: [{ verb: 'VERB', url: '/foo/bar' }]
        },
        empty: {
          http: []
        }
      }
    };

    const serverInfoResponse = {
      serverInfo: {
        kuzzle: {
          api: {
            routes: {
              gordon: {
                freeman: {
                  http: [{ verb: 'VERB', url: '/gordon/freeman' }]
                },
                vance: {
                  http: []
                }
              }
            }
          }
        }
      }
    };

    beforeEach(() => {
      protocol._sendHttpRequest = sinon.stub();
      protocol._warn = sinon.stub();

      protocol._sendHttpRequest.resolves({ result: serverPublicApiResult });
    });

    it('should get routes from server:publicApi', () => {
      return protocol.connect()
        .then(() => {
          should(protocol.routes).match({
            foo: {
              bar: { verb: 'VERB', url: '/foo/bar' }
            }
          });
          should(protocol._warn).not.be.called();
        });
    });

    it('should fallback to static routes if server:publicApi is restricted', () => {
      protocol._sendHttpRequest.onCall(0).resolves({ error: { status: 401 } });

      return protocol.connect()
        .then(() => {
          should(protocol.routes).match(staticHttpRoutes);
          should(protocol._warn.callCount).be.eql(3);
        });
    });

    it('should fallback to server:info if server:publicApi is not available', () => {
      protocol._sendHttpRequest
        .onCall(0).resolves({ error: { status: 404 } })
        .onCall(1).resolves({ result: serverInfoResponse });

      return protocol.connect()
        .then(() => {
          should(protocol.routes).match({
            gordon: {
              freeman: { verb: 'VERB', url: '/gordon/freeman' }
            }
          });
          should(protocol._warn).not.be.called();
        });
    });

    it('should fallback to static routes if server:info is restricted', () => {
      protocol._sendHttpRequest
        .onCall(0).resolves({ error: { status: 404 } })
        .onCall(1).resolves({ error: { status: 403 } });

      return protocol.connect()
        .then(() => {
          should(protocol.routes).match(staticHttpRoutes);
          should(protocol._warn.callCount).be.eql(4);
        });
    });

    it('should inject customRoutes', () => {
      const customRoutes = {
        'gordon' : {
          freeman: { verb: 'POST', url: '/gordon/freeman'}
        },
        'plugin-test/example': {
          liia: { verb: 'GET', url: '/_plugin/plugin-test/example'}
        }
      };
      protocol = new Http('kuzzle', { customRoutes });
      protocol._warn = sinon.stub();
      protocol._sendHttpRequest = sinon.stub().resolves({ result: serverPublicApiResult });

      return protocol.connect()
        .then(() => {
          should(protocol.routes.gordon).match({
            freeman: { verb: 'POST', url: '/gordon/freeman'}
          });

          should(protocol.routes['plugin-test/example']).match({
            liia: { verb: 'GET', url: '/_plugin/plugin-test/example'}
          });
        });
    });

    it('should initialize protocol status and route list', () => {
      const promise = protocol.connect();

      should(protocol.state).be.eql('offline');

      return promise.then(() => {
        should(protocol.state).be.eql('ready');

        should(protocol.routes.foo.bar).match({verb: 'VERB', url: '/foo/bar'});
        should(protocol.routes.foo.empty).be.undefined();
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
      protocol._routes = {
        foo: {bar: {verb: 'VERB', url: '/foo/bar'}},
        index: {create: {verb: 'VERB', url: '/:index/_create'}},
        getreq: {action: {verb: 'GET', url: '/foo'}}
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
        try {
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
        }
        catch (e) {
          done(e);
        }
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
        try {
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
        }
        catch (e) {
          done(e);
        }
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
        try {
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
        }
        catch (e) {
          done(e);
        }
      });

      protocol.send(data);
    });

    it('should inject the body as querystring on a GET request', done => {
      const data = {
        requestId: 'requestId',
        action: 'action',
        controller: 'getreq',
        body: {foo: 'bar', baz: ['oh', 'an', 'array'] }
      };

      protocol.on('requestId', () => {
        try {
          should(protocol._sendHttpRequest).be.calledOnce();
          should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('GET');
          should(protocol._sendHttpRequest.firstCall.args[1])
            .be.equal(`/foo?foo=bar&baz=${encodeURIComponent('oh,an,array')}`);
          done();
        }
        catch (error) {
          done(error);
        }
      });

      protocol.send(data);
    });

    it('should inject the nested body object as querystring on a GET request', done => {
      const data = {
        requestId: 'requestId',
        action: 'action',
        controller: 'getreq',
        body: { foo: { foofoo: { barbar: 'bar' } }, '&baz': ['oh', 'an', 'array'] }
      };

      protocol.on('requestId', () => {
        try {
          should(protocol._sendHttpRequest).be.calledOnce();
          should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('GET');
          should(protocol._sendHttpRequest.firstCall.args[1])
            .be.equal(`/foo?foo=${encodeURIComponent('{"foofoo":{"barbar":"bar"}}')}&${encodeURIComponent('&baz')}=${encodeURIComponent('oh,an,array')}`);
          done();
        }
        catch (error) {
          done(error);
        }
      });

      protocol.send(data);
    });

    it('should inject queryString to the HTTP request', done => {
      const data = {
        requestId: 'requestId',
        action: 'bar',
        controller: 'foo',
        'foo?lol': 'bar&baz'
      };

      protocol.on('requestId', () => {
        should(protocol._sendHttpRequest).be.calledOnce();

        should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
        should(protocol._sendHttpRequest.firstCall.args[1])
          .be.equal(`/foo/bar?${encodeURIComponent('foo?lol')}=${encodeURIComponent('bar&baz')}`);

        done();
      });

      protocol.send(data);
    });

    it('should inject placeholders parameters', done => {
      const data = {
        requestId: 'requestId',
        controller: 'foo',
        action: 'bar',
        foo: 'baz&qux'
      };
      protocol._routes = {
        foo: {bar: {verb: 'VERB', url: '/foo/bar/:foo'}}
      };

      protocol.on('requestId', () => {
        should(protocol._sendHttpRequest).be.calledOnce();

        should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
        should(protocol._sendHttpRequest.firstCall.args[1])
          .be.equal(`/foo/bar/${encodeURIComponent('baz&qux')}`);

        done();
      });

      protocol.send(data);
    });

    it('should not send any HTTP request and emit a "No URL found" event if no route is defined', done => {
      const data = {
        requestId: 'requestId',
        controller: 'bar',
        action: 'foo'
      };

      protocol.on('requestId', ({ status, error }) => {
        should(protocol._sendHttpRequest).not.be.called();

        should(status).be.equal(400);
        should(error.message).be.equal('No URL found for "bar:foo".');

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

    it('should properly encode arrays into the querystring', done => {
      const data = {
        requestId: 'requestId',
        action: 'bar',
        controller: 'foo',
        foo: ['bar', 'baz', 'qux'],
        qux: 123
      };

      protocol.on('requestId', () => {
        try {
          should(protocol._sendHttpRequest).be.calledOnce();
          should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
          should(protocol._sendHttpRequest.firstCall.args[1])
            .be.equal(`/foo/bar?foo=${encodeURIComponent('bar,baz,qux')}&qux=123`);
        }
        catch (error) {
          return done(error);
        }

        done();
      });

      protocol.send(data);
    });

    it('should properly encode boolean flags in the querystring', done => {
      const data = {
        requestId: 'requestId',
        action: 'bar',
        controller: 'foo',
        foo: false,
        '?bar': true,
        qux: 123
      };

      protocol.on('requestId', () => {
        try {
          should(protocol._sendHttpRequest).be.calledOnce();
          should(protocol._sendHttpRequest.firstCall.args[0]).be.equal('VERB');
          should(protocol._sendHttpRequest.firstCall.args[1])
            .be.equal(`/foo/bar?${encodeURIComponent('?bar')}&qux=123`);
        }
        catch (error) {
          return done(error);
        }

        done();
      });

      protocol.send(data);
    });

    it('should return and discard request when an URL param is missing', done => {
      const data = {
        requestId: 'requestId',
        controller: 'index',
        action: 'create'
      };

      protocol.on('requestId', error => {
        should(protocol._sendHttpRequest).not.be.called();
        should(error.status).be.eql(400);

        done();
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

      const { default: MockHttp } = proxyquire('../../src/protocols/Http', {
        'min-req-promise': {request: httpRequestStub}
      });

      protocol = new MockHttp('address', { port: 1234 });
    });

    it('should call http.request with empty body', () => {
      protocol._sendHttpRequest('VERB', '/foo/bar');

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith(
        'http://address:1234/foo/bar',
        'VERB',
        {
          body: undefined,
          headers: { 'Content-Length': 0 },
          timeout: 0
        });
    });

    it('should call http.request with a body', () => {
      const body = 'http request body';
      protocol._sendHttpRequest('VERB', '/foo/bar', {body});

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith(
        'http://address:1234/foo/bar',
        'VERB',
        {
          body: 'http request body',
          headers: { 'Content-Length': body.length },
          timeout: 0
        });
    });

    it('should call http.request with configured timeout', () => {
      protocol.timeout = 42000;
      protocol._sendHttpRequest('VERB', '/foo/bar');

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith(
        'http://address:1234/foo/bar',
        'VERB',
        {
          body: undefined,
          headers: { 'Content-Length': 0 },
          timeout: 42000
        });
    });

    it('should call http.request with a body and some headers', () => {
      const body = 'http request body';
      protocol._sendHttpRequest('VERB', '/foo/bar', {body, headers: {foo: 'bar'}});

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub).be.calledWith(
        'http://address:1234/foo/bar',
        'VERB',
        {
          body: 'http request body',
          headers: { 'Content-Length': body.length, foo: 'bar' },
          timeout: 0
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
        setRequestHeader: sinon.stub(),
        onreadystatechange: sinon.stub(),
        timeout: 0
      };
      // eslint-disable-next-line no-native-reassign, no-global-assign
      XMLHttpRequest = function() {
        return xhrStub;
      };

      protocol = new Http('address', { port: 1234 });
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

    it('should call XMLHttpRequest with configured timeout', () => {
      protocol.timeout = 42000;

      protocol._sendHttpRequest('VERB', '/foo/bar');

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.timeout).be.eql(42000);
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

    it('should reject if the xhr ready state is done and the status is 0', () => {
      xhrStub.readyState = 4;
      xhrStub.status = 0;

      setTimeout(() => xhrStub.onreadystatechange(), 20);

      return should(protocol._sendHttpRequest('VERB', '/foo/bar', { body: 'foobar' }))
        .be.rejectedWith({ message: 'Cannot connect to host. Is the host online?' });
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

  describe('_constructRoutes', () => {
    it('should construct http routes from server:publicApi', () => {
      const publicApi = {
        document: {
          search: {
            http: [
              { verb: 'GET', url: '/:index/:collection/' },
              { verb: 'POST', url: '/:index/:collection/_search' }
            ]
          }
        },
        foo: {
          login: {
            http: [
              { verb: 'GET', url: '/_login/:strategy' },
              { verb: 'POST', url: '/_login/:strategy' },
            ]
          },
          create: {
            http: [
              { verb: 'POST', url: '/:index/:collection/_create' },
              { verb: 'POST', url: '/:index/:collection/:_id/_create' }
            ]
          },
          mGet: {
            http: [
              { verb: 'GET', url: '/:index/:collection/_mGet' },
              { verb: 'POST', url: '/:index/:collection/_mGet' }
            ]
          },
          subscribe: {},
          list: {
            http: [ { verb: 'GET', url: '/:index/_list' } ]
          }
        },
      };


      const routes = protocol._constructRoutes(publicApi);

      should(routes.foo.list.url).be.eql('/:index/_list');
      should(routes.foo.list.verb).be.eql('GET');

      // with same URL size, we keep the GET route
      should(routes.foo.login.url).be.eql('/_login/:strategy');
      should(routes.foo.login.verb).be.eql('GET');

      // with same URL size, we keep the GET route
      should(routes.foo.mGet.url).be.eql('/:index/:collection/_mGet');
      should(routes.foo.mGet.verb).be.eql('GET');


      // with differents URL sizes, we keep the shortest because URL params
      // will be in the query string
      should(routes.foo.create.url).be.eql('/:index/:collection/_create');

      // we should choose the POST route for document:create
      should(routes.document.search.url).be.eql('/:index/:collection/_search');

      should(routes.foo.subscribe).be.undefined();
    });

    it('should overwrite kuzzle routes with custom routes', () => {
      const publicApi = {
        foo: {
          list: {
            http: [ { verb: 'GET', url: '/:index/_list' } ]
          }
        },
      };
      const customRoutes = {
        foo: {
          list: { verb: 'GET', url: '/overwrite/me/master' }
        }
      };

      protocol = new Http('address', { port: 1234, customRoutes });

      const routes = protocol._constructRoutes(publicApi);

      should(routes.foo.list.url).be.eql('/overwrite/me/master');
      should(routes.foo.list.verb).be.eql('GET');
    });
  });
});
