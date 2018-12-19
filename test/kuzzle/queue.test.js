const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle queue', () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock({host: 'somewhere'});
    kuzzle = new Kuzzle(protocol);
  });

  describe('#flushQueue', () => {
    it('should flush the offline queue', () => {
      kuzzle.offlineQueue.push({ foo: 'bar' });

      kuzzle.flushQueue();

      should(kuzzle._offlineQueue).be.empty();
    });
  });

  describe('#playQueue', () => {
    let query;

    beforeEach(() => {
      query = { request: { requestId: 'alfen', action: 'action', controller: 'controller' } };

      kuzzle.protocol.isReady.returns(true);
      kuzzle._cleanQueue = sinon.stub();
    });

    it('should start playing queue', () => {
      kuzzle._dequeue = sinon.stub();

      kuzzle.playQueue();

      should(kuzzle._cleanQueue).be.calledOnce();
      should(kuzzle._dequeue).be.calledOnce();
    });

    it('should not play the queue if protocol is not ready', () => {
      kuzzle._dequeue = sinon.stub();
      kuzzle.protocol.isReady.returns(false);

      kuzzle.playQueue();

      should(kuzzle._cleanQueue).not.be.calledOnce();
      should(kuzzle._dequeue).not.be.calledOnce();
    });

    it('should play the offline queue', () => {
      kuzzle.offlineQueue.push(query);

      kuzzle.playQueue();

      should(kuzzle.protocol.query).be.calledWith(query.request);
    });

    it('should emit offlineQueuePop event', () => {
      const spy = sinon.spy();
      kuzzle.offlineQueue.push(query);
      kuzzle.addListener('offlineQueuePop', playedQuery => {
        spy(playedQuery);
      });

      kuzzle.playQueue();

      should(spy).be.calledWith(query);
    });

    it('should play an additional queue returned by offlineQueueLoader', done => {
      const query2 = { request: { requestId: 'plum', action: 'action', controller: 'controller' } };

      kuzzle.offlineQueue.push(query);
      kuzzle.offlineQueueLoader = () => [query2];

      kuzzle.playQueue();

      // Wait queries to be dequeued
      setTimeout(() => {
        should(kuzzle.protocol.query).be.calledTwice();
        should(kuzzle.protocol.query.getCall(0).args[0]).be.eql(query2.request);
        should(kuzzle.protocol.query.getCall(1).args[0]).be.eql(query.request);
        done();
      }, 10);
    });
  });
});
