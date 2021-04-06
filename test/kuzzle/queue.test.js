const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  { Kuzzle } = require('../../src/Kuzzle');

describe('Kuzzle queue', () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock('somewhere');
    kuzzle = new Kuzzle(protocol);
    kuzzle._timeoutRequest = sinon.stub().resolves();
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
      query = { request: { requestId: 'alfen', action: 'action', controller: 'controller' }, timeout: 10000 };

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

      should(kuzzle._timeoutRequest).be.calledWith(
        10000,
        {
          request: query.request,
        }
      );
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
        should(kuzzle._timeoutRequest).be.calledTwice();
        should(kuzzle._timeoutRequest.getCall(0).args[1].request).be.eql(query2.request);
        should(kuzzle._timeoutRequest.getCall(1).args[1].request).be.eql(query.request);
        done();
      }, 100);
    });

    it('should play an additional queue returned by an asynchronous offlineQueueLoader', done => {
      const query2 = { request: { requestId: 'plum', action: 'action', controller: 'controller' } };

      kuzzle.offlineQueue.push(query);
      kuzzle.offlineQueueLoader = () => {
        return new Promise(resolve => {
          setImmediate(() => resolve([query2]));
        });
      };

      kuzzle.playQueue();

      // Wait queries to be dequeued
      setTimeout(() => {
        should(kuzzle._timeoutRequest).be.calledTwice();
        should(kuzzle._timeoutRequest.getCall(0).args[1].request).be.eql(query2.request);
        should(kuzzle._timeoutRequest.getCall(1).args[1].request).be.eql(query.request);
        done();
      }, 100);
    });
  });
});
