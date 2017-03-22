var
  should = require('should'),
  Kuzzle = require('../../src/Kuzzle');


describe('Event emitter', function () {
  var
    kuzzle,
    emitEvent;

  before(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    emitEvent = kuzzle.emitEvent;
  });

  it('should call all added listeners for a given event', function (done) {
    var
      listenersCalled = 0,
      listener = function () {
        listenersCalled++;
      },
      context = {
        eventListeners: {
          foo: {
            lastEmitted: null,
            listeners: [
              {fn: listener},
              {fn: listener},
              {fn: listener}
            ]
          }
        }
      };

    emitEvent.call(context, 'foo');

    setTimeout(function () {
      should(listenersCalled).be.eql(3);
      done();
    }, 0);
  });

  it('should allow providing any number of arguments', function (done) {
    var
      argsCount = 0,
      listener = function () {
        argsCount = arguments.length;
      },
      context = {
        eventTimeout: -100,
        eventListeners: {
          foo: {
            lastEmitted: null,
            listeners: [
              {fn: listener}
            ]
          }
        }
      };

    emitEvent.call(context, 'foo');

    setTimeout(function () {
      should(argsCount).be.eql(0);
      emitEvent.call(context, 'foo', 'bar');

      setTimeout(function () {
        should(argsCount).be.eql(1);
        argsCount = 0;
        emitEvent.call(context, 'foo', 'bar', ['foo', 'bar']);

        setTimeout(function () {
          should(argsCount).be.eql(2);
          argsCount = 0;
          emitEvent.call(context, 'foo', {foo: 'bar'}, 'bar', ['foo', 'bar']);

          setTimeout(function () {
            should(argsCount).be.eql(3);
            done();
          }, 0);
        }, 0);
      }, 0);
    }, 0);
  });

  it('should not re-emit an event before event timeout', function (done) {
    var
      listenerCalled = 0,
      listener = function () {
        listenerCalled++;
      },
      context = {
        eventTimeout: 20,
        eventListeners: {
          foo: {
            lastEmitted: null,
            listeners: [
              {fn: listener}
            ]
          }
        }
      };

    emitEvent.call(context, 'foo');
    emitEvent.call(context, 'foo');
    emitEvent.call(context, 'foo');
    emitEvent.call(context, 'foo');

    setTimeout(function () {
      should(listenerCalled).be.eql(1);

      setTimeout(function () {
        emitEvent.call(context, 'foo');

        setTimeout(function () {
          should(listenerCalled).be.eql(2);
          done();
        }, 0);
      }, 30);
    }, 0);
  });
});
