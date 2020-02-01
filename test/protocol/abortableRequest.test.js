const
  should = require('should'),
  sinon = require('sinon'),
  AbortableRequest = require('../../src/protocols/http/abortableRequest');

describe('AbortableRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('#run', () => {
    it('should abort the request after timeout', done => {
      const
        requestStub = {
          on: sinon.stub(),
          write: sinon.stub(),
          end: sinon.stub(),
          abort: sinon.stub()
        },
        httpRequestStub = sinon.stub().returns(requestStub),
        options = {
          host: 'localhost',
          port: 7512,
          body: 'hello',
          headers: {},
          timeout: 0,
          method: 'GET',
          path: '/foobar'
        },
        abortableRequest = new AbortableRequest('http', 10, options);

      sinon.stub(abortableRequest, '_nodeClient').returns({
        request: httpRequestStub
      });

      abortableRequest.run();

      setTimeout(() => {
        should(requestStub.abort).be.calledOnce();
        done();
      }, 11);
    });
  });

  describe('#sendHttpRequest NodeJS', () => {
    let
      abortableRequest,
      options,
      httpRequestStub;

    beforeEach(() => {
      options = {
        host: 'localhost',
        port: 7512,
        body: 'hello',
        headers: {},
        timeout: 0,
        method: 'GET',
        path: '/foobar'
      };

      abortableRequest = new AbortableRequest('http', 0, options);

      httpRequestStub = sinon.stub().returns({
        on: sinon.stub(),
        write: sinon.stub(),
        end: sinon.stub(),
        abort: sinon.stub()
      });

      sinon.stub(abortableRequest, '_nodeClient').returns({
        request: httpRequestStub
      });
    });

    it('should call http.request with a body', async () => {
      const promise = abortableRequest.run();
      abortableRequest.resolve('{"foo":"bar"}');

      const result = await promise;

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub.getCall(0).args[0]).eql({
        host: 'localhost',
        port: 7512,
        body: 'hello',
        headers: {
          'Content-Length': options.body.length
        },
        timeout: 0,
        method: 'GET',
        path: '/foobar'
      });
      should(result).be.eql('{"foo":"bar"}');
    });

    it('should call http.request with a body and some headers', async () => {
      abortableRequest._options.headers.foo = 'bar';
      const promise = abortableRequest.run();
      abortableRequest.resolve('{"foo":"bar"}');

      await promise;

      should(httpRequestStub).be.calledOnce();
      should(httpRequestStub.getCall(0).args[0]).eql({
        host: 'localhost',
        port: 7512,
        body: 'hello',
        headers: {
          'Content-Length': options.body.length,
          foo: 'bar'
        },
        timeout: 0,
        method: 'GET',
        path: '/foobar'
      });
    });
  });

  /**
   * @global XMLHttpRequest
   */
  describe('#sendHttpRequest XMLHttpRequest', () => {
    let
      xhrStub,
      abortableRequest,
      options;

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

      options = {
        host: 'localhost',
        port: 7512,
        body: 'hello',
        headers: {},
        timeout: 0,
        method: 'GET',
        path: '/foobar'
      };

      abortableRequest = new AbortableRequest('http', 0, options);
    });

    afterEach(() => {
      // eslint-disable-next-line no-native-reassign, no-global-assign
      XMLHttpRequest = undefined;
    });

    it('should call XMLHttpRequest with empty body', async () => {
      abortableRequest._options.body = undefined;
      const promise = abortableRequest.run();
      abortableRequest.resolve('{ "foo": "bar" }');

      await promise;

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('GET', 'http://localhost:7512/foobar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith(undefined);

      should(xhrStub.setRequestHeader).not.be.called();
    });

    it('should call XMLHttpRequest with a body', async () => {
      const promise = abortableRequest.run();
      abortableRequest.resolve('{ "foo": "bar" }');

      await promise;

      should(xhrStub.open).be.calledOnce();
      should(xhrStub.open).be.calledWith('GET', 'http://localhost:7512/foobar');

      should(xhrStub.send).be.calledOnce();
      should(xhrStub.send).be.calledWith('hello');

      should(xhrStub.setRequestHeader).not.be.called();
    });

    it('should call XMLHttpRequest with headers', async () => {
      abortableRequest._options.headers.foo = 'bar';
      const promise = abortableRequest.run();
      abortableRequest.resolve('{ "foo": "bar" }');

      await promise;

      should(xhrStub.setRequestHeader).be.calledOnce();
      should(xhrStub.setRequestHeader).be.calledWith('foo', 'bar');
    });

    it('should resolve with the backend response', async () => {
      const promise = abortableRequest.run();
      xhrStub.responseText = '{"status": 200, "result": "Kuzzle Result"}';
      xhrStub.onload();

      const result = await promise;

      should(result).be.eql('{"status": 200, "result": "Kuzzle Result"}');
    });

    it('should reject if the xhr ready state is done and the status is 0', () => {
      xhrStub.readyState = 4;
      xhrStub.status = 0;

      setTimeout(() => xhrStub.onreadystatechange(), 20);

      return should(abortableRequest.run())
        .be.rejectedWith({ message: 'Cannot connect to host. Is the host online?' });
    });
  });
});

