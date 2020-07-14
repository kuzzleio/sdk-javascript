const should = require('should');
const sinon = require('sinon');

const ProtocolMock = require('../mocks/protocol.mock');
const { Kuzzle } = require('../../src/Kuzzle');

describe('Kuzzle listeners management', () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock();
    kuzzle = new Kuzzle(protocol, {eventTimeout: 20});
    sinon.stub(kuzzle, '_superAddListener');
    sinon.stub(kuzzle, '_superEmit');
  });

  it('should only listen to allowed events', () => {
    const knownEvents = [
      'connected',
      'discarded',
      'disconnected',
      'loginAttempt',
      'networkError',
      'offlineQueuePush',
      'offlineQueuePop',
      'queryError',
      'reconnected',
      'tokenExpired'
    ];

    should(function() {
      kuzzle.addListener('foo', sinon.stub());
    }).throw('[foo] is not a known event. Known events: ' + knownEvents.toString());

    let i;
    for (i = 0; i < knownEvents.length; i++) {
      kuzzle.addListener(knownEvents[i], sinon.stub());
    }

    should(kuzzle._superAddListener).have.called(10);

    for (i = 0; i < knownEvents.length; i++) {
      should(kuzzle._superAddListener.getCall(i)).be.calledWith(knownEvents[i]);
    }
  });

  it('should not re-emit an event before event timeout', done => {

    kuzzle.emit('connected', 'foo');
    kuzzle.emit('connected', 'foo');
    kuzzle.emit('connected', 'foo');
    kuzzle.emit('connected', 'foo');
    kuzzle.emit('offlineQueuePush', 'bar');

    setTimeout(function () {
      should(kuzzle._superEmit).be.calledTwice();
      should(kuzzle._superEmit.firstCall).be.calledWith('connected', 'foo');
      should(kuzzle._superEmit.secondCall).be.calledWith('offlineQueuePush', 'bar');

      kuzzle._superEmit.reset();
      setTimeout(function () {
        kuzzle.emit('connected', 'bar');
        kuzzle.emit('connected', 'bar');

        setTimeout(function () {
          should(kuzzle._superEmit).be.calledOnce();
          should(kuzzle._superEmit).be.calledWith('connected', 'bar');
          done();
        }, 0);
      }, 30);
    }, 0);
  });

});
