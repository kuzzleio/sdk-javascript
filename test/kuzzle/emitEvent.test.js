var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle');


describe('Event emitter', () => {
  var
    emitEvent;

  before(function () {
    emitEvent = Kuzzle.__get__('emitEvent');
  });

  it('should call all added listeners for a given event', function () {
    var
      listenersCalled = 0,
      listener = function () {
        listenersCalled++;
      },
      context = {
        eventListeners: {
          foo: [
            {fn: listener},
            {fn: listener},
            {fn: listener}
          ]
        }
      };

    emitEvent.call(context, 'foo');
    should(listenersCalled).be.eql(3);
  });

  it('should allow providing any number of arguments', function () {
    var
      argsCount = 0,
      listener = function () {
        argsCount = arguments.length;
      },
      context = {
        eventListeners: {
          foo: [
            {fn: listener}
          ]
        }
      };

    emitEvent.call(context, 'foo');
    should(argsCount).be.eql(0);

    emitEvent.call(context, 'foo', 'bar');
    should(argsCount).be.eql(1);

    argsCount = 0;
    emitEvent.call(context, 'foo', 'bar', ['foo', 'bar']);
    should(argsCount).be.eql(2);

    argsCount = 0;
    emitEvent.call(context, 'foo', {foo: 'bar'}, 'bar', ['foo', 'bar']);
    should(argsCount).be.eql(3);
  });
});