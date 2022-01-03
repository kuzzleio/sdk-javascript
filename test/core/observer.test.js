const sinon = require('sinon');
const should = require('should');

const { Observer } = require('../../src/core/Observer');
const { RealtimeDocument } = require('../../src/core/RealtimeDocument');

describe('Observer', () => {
  let observer;
  let sdk;
  let doc1;
  let doc2;
  let error1;
  let rtDoc1;
  let rtDoc2;
  let _searchReturn;
  let roomId;

  beforeEach(() => {
    roomId = 'roomId';

    error1 = { reason: 'error1' };
    doc1 = { _id: 'doc1', _source: { name: 'doc 1' } };
    doc2 = { _id: 'doc2', _source: { name: 'doc 2' } };

    rtDoc1 = new RealtimeDocument({ _id: 'doc1', _source: { name: 'doc 1' } });
    rtDoc2 = new RealtimeDocument({ _id: 'doc2', _source: { name: 'doc 2' } });

    _searchReturn = {
      response: {
        result: {
          hits: [doc1, doc2]
        }
      },
      request: { index: 'index', collection: 'collection' },
      opts: { name: 'opts' }
    };

    sdk = {
      document: {
        get: sinon.stub().resolves(doc1),
        mGet: sinon.stub().resolves({ successes: [doc1, doc2], errors: [error1] }),
        _search: sinon.stub().resolves(_searchReturn),
      },
      realtime: {
        subscribe: sinon.stub().resolves(roomId),
        unsubscribe: sinon.stub().resolves(),
      },
      protocol: {
        name: 'websocket'
      }
    };

    observer = new Observer(sdk);
  });

  describe('#constructor', () => {
    it('should choose pulling mode with HTTP protocol', () => {
      sdk.protocol.name = 'http';

      observer = new Observer(sdk);

      should(observer.mode).be.eql('pulling');
      should(observer.options.pullingDelay).be.eql(5000);
    });

    it('should save the SDK instance', () => {
      observer = new Observer(sdk);

      should(observer.sdk).be.equal(sdk);
    });
  });

  describe('#stop', () => {
    it('should call disposeDocuments', async () => {
      sinon.stub(observer, 'disposeDocuments').resolves();

      await observer.stop('index', 'collection', [doc1]);

      should(observer.disposeDocuments).be.called('index', 'collection', [doc1]);
    });

    it('should call disposeCollection', async () => {
      sinon.stub(observer, 'disposeCollection').resolves();

      await observer.stop('index', 'collection');

      should(observer.disposeCollection).be.called('index', 'collection');
    });

    it('should call disposeAll', async () => {
      sinon.stub(observer, 'disposeAll').resolves();

      await observer.stop();

      should(observer.disposeAll).be.called();
    });

    it('should throw error with only index', async () => {
      await should(observer.stop('index')).be.rejected();
    });
  });

  describe('#disposeDocuments', () => {
    it('should delete documents and watch collection', async () => {
      sinon.stub(observer, 'watchCollection').resolves();
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);

      await observer.disposeDocuments('index', 'collection', [doc1]);

      const observedDocuments = observer.documentsByCollection.get('index:collection');
      should(observedDocuments.ids).be.eql(['doc2']);
      should(observer.documents.has('index:collection:doc1')).be.false();
      should(observer.watchCollection).be.calledWith('index', 'collection');
    });

    it('should remove observedDocuments if there is no more documents', async () => {
      sinon.stub(observer, 'watchCollection').resolves();
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);

      await observer.disposeDocuments('index', 'collection', [doc1, doc2]);

      should(observer.documentsByCollection.has('index:collection')).be.false();
    });
  });

  describe('#disposeCollection', () => {
    it('should delete documents and unsubscribe (mode realtime)', async () => {
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);
      observer.documentsByCollection.get('index:collection').roomId = 'roomId';

      await observer.disposeCollection('index', 'collection');

      should(observer.documents.size).be.eql(0);
      should(observer.documentsByCollection.has('index:collection')).be.false();
      should(sdk.realtime.unsubscribe).be.calledWith('roomId');
    });

    it('should delete documents and clear timer (mode pulling)', async () => {
      sdk.protocol.name = 'http';
      observer = new Observer(sdk);
      sinon.stub(observer, 'clearPullingTimer').resolves();
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);
      observer.documentsByCollection.get('index:collection').roomId = 'roomId';

      await observer.disposeCollection('index', 'collection');

      should(observer.documents.size).be.eql(0);
      should(observer.documentsByCollection.has('index:collection')).be.false();
      should(observer.clearPullingTimer).be.called();
    });
  });

  describe('#disposeAll', () => {
    it('should delete documents and unsubscribe (mode realtime)', async () => {
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);
      observer.addDocument('index', 'collection2', doc2);
      observer.documentsByCollection.get('index:collection').roomId = 'roomId';
      observer.documentsByCollection.get('index:collection2').roomId = 'roomId2';

      await observer.disposeAll();

      should(observer.documents.size).be.eql(0);
      should(observer.documentsByCollection.size).be.eql(0);
      should(sdk.realtime.unsubscribe)
        .be.calledWith('roomId')
        .be.calledWith('roomId2');
    });

    it('should delete documents and unsubscribe (mode pulling)', async () => {
      sdk.protocol.name = 'http';
      observer = new Observer(sdk);
      sinon.stub(observer, 'clearPullingTimer').resolves();
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);
      observer.addDocument('index', 'collection2', doc2);

      await observer.disposeAll();

      should(observer.documents.size).be.eql(0);
      should(observer.documentsByCollection.size).be.eql(0);
      should(observer.clearPullingTimer).be.calledOnce();
      should(sdk.realtime.unsubscribe).not.be.called();
    });
  });

  describe('#get', () => {
    it('should use Document.get and observe returned document', async () => {
      sinon.stub(observer, 'observe').resolves(rtDoc1);

      const rtDoc = await observer.get('index', 'collection', 'id', 'opts');

      should(sdk.document.get).be.calledWith('index', 'collection', 'id', 'opts');
      should(observer.observe).be.calledWith('index', 'collection', doc1);
      should(rtDoc).be.eql(rtDoc1);
    });
  });

  describe('#mGet', () => {
    it('should use Document.mGet, add documents and watchCollection', async () => {
      sinon.stub(observer, 'watchCollection').resolves();
      sinon.stub(observer, 'addDocument')
        .onCall(0).returns(rtDoc1)
        .onCall(1).returns(rtDoc2);

      const { successes, errors } = await observer.mGet(
        'index',
        'collection',
        ['id', 'id2'],
        'opts');

      should(sdk.document.mGet)
        .be.calledWith('index', 'collection', ['id', 'id2'], 'opts');
      should(observer.addDocument)
        .be.calledTwice()
        .be.calledWith('index', 'collection', doc1)
        .be.calledWith('index', 'collection', doc2);
      should(observer.watchCollection).be.calledWith('index', 'collection');
      should(successes).be.eql([rtDoc1, rtDoc2]);
      should(errors).be.eql([error1]);
    });
  });

  describe('#search', () => {
    it('should use Document.search then build and start search result', async () => {
      sinon.stub(observer, 'watchCollection').resolves();
      sinon.stub(observer, 'addDocument')
        .onCall(0).returns(rtDoc1)
        .onCall(1).returns(rtDoc2);
      const query = { name: 'query' };
      const options = { name: 'options' };

      const result = await observer.search('index', 'collection', query, options);

      should(sdk.document._search)
        .be.calledWith('index', 'collection', query, options);
      // Called by RealtimeDocumentSearchResult
      should(observer.addDocument)
        .be.calledTwice()
        .be.calledWith('index', 'collection', doc1)
        .be.calledWith('index', 'collection', doc2);
      should(observer.watchCollection).be.calledWith('index', 'collection');
      should(result.hits).be.eql([rtDoc1, rtDoc2]);
    });
  });

  describe('#observe', () => {
    it('should add the document and call watchCollection', async () => {
      sinon.stub(observer, 'watchCollection').resolves();
      sinon.stub(observer, 'addDocument').returns(rtDoc1);

      const rtDoc = await observer.observe('index', 'collection', doc1);

      should(observer.addDocument).be.calledWith('index', 'collection', doc1);
      should(observer.watchCollection).be.calledWith('index', 'collection');
      should(rtDoc).be.eql(rtDoc1);
    });
  });

  describe('#addDocument', () => {
    it('should add the document to the managed docs and return a realtime doc', () => {
      const rtDoc = observer.addDocument('index', 'collection', doc1);

      const observedDocuments = observer.documentsByCollection.get('index:collection');
      should(observedDocuments.ids).be.eql(['doc1']);
      should(observedDocuments.filters).be.eql({ ids: { values: ['doc1'] } });

      const internalRtDoc = observer.documents.get('index:collection:doc1');
      should(internalRtDoc).match({
        _id: 'doc1',
        _source: { name: 'doc 1' },
        deleted: false,
      });
      should(rtDoc).be.eql(internalRtDoc);
    });
  });

  describe('#watchCollection', () => {
    it('should call resubscribe (mode realtime)', async () => {
      sinon.stub(observer, 'resubscribe').resolves();

      await observer.watchCollection('index', 'collection');

      should(observer.resubscribe).be.calledWith('index', 'collection');
    });

    it('should call resubscribe (mode pulling)', async () => {
      sdk.protocol.name = 'http';
      observer = new Observer(sdk);
      sinon.stub(observer, 'startPulling').resolves();

      await observer.watchCollection('index', 'collection');

      should(observer.startPulling).be.calledOnce();
    });
  });

  describe('#startPulling', () => {

    beforeEach(() => {
      sdk.protocol.name = 'http';
      observer = new Observer(sdk, { pullingDelay: 1 });
      sinon.spy(observer, 'clearPullingTimer');
      sinon.stub(observer, 'pullingHandler').resolves();
    });

    it('should clear timer and start interval', done => {
      observer.addDocument('index', 'collection', doc1);

      observer.startPulling();

      setTimeout(() => {
        should(observer.clearPullingTimer).be.calledOnce();
        should(observer.pullingHandler).be.called();
        observer.stop();
        done();
      }, 3);
    });

    it('should not start the timer if there is no documents', done => {
      observer.startPulling();

      setTimeout(() => {
        should(observer.clearPullingTimer).be.calledOnce();
        should(observer.pullingHandler).not.be.called();
        done();
      }, 3);
    });
  });

  describe('#pullingHandler', () => {
    it('should do nothing if there is no observed documents', async () => {
      await observer.pullingHandler();

      should(sdk.document.mGet).not.be.called();
    });

    it('should use mGet method to retrieve documents in each collections', async () => {
      const rt1 = observer.addDocument('index', 'collection1', doc1);
      const rt2 = observer.addDocument('index', 'collection2', doc2);
      sdk.document.mGet.onCall(0).resolves({
        successes: [{
          _id: 'doc1',
          _source: { age: 41 },
        }],
        errors: [],
      });
      sdk.document.mGet.onCall(1).resolves({
        successes: [{
          _id: 'doc2',
          _source: { age: 42 },
        }],
        errors: [],
      });

      await observer.pullingHandler();

      should(sdk.document.mGet)
        .be.calledWith('index', 'collection1', ['doc1'])
        .be.calledWith('index', 'collection2', ['doc2']);
      should(rt1._source.age).be.eql(41);
      should(rt2._source.age).be.eql(42);
    });

    it('should use set the delete flag', async () => {
      const rt1 = observer.addDocument('index', 'collection1', doc1);
      sdk.document.mGet.resolves({
        successes: [],
        errors: ['doc1'],
      });

      await observer.pullingHandler();

      should(sdk.document.mGet)
        .be.calledWith('index', 'collection1', ['doc1']);
      should(rt1.deleted).be.true();
    });
  });

  describe('#resubscribe', () => {
    it('should subscribe to new filters and then unsubscribe old roomId', async () => {
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);
      const observedDocuments = observer.documentsByCollection.get('index:collection');
      observedDocuments.roomId = 'oldRoomId';

      await observer.resubscribe('index', 'collection');

      const args = sdk.realtime.subscribe.getCall(0).args;
      should(args[0]).be.eql('index');
      should(args[1]).be.eql('collection');
      should(args[2]).be.eql({ ids: { values: ['doc1', 'doc2'] } });
      should(args[3].name).be.eql('bound notificationHandler');

      should(observedDocuments.roomId).be.eql(roomId);
      should(sdk.realtime.unsubscribe).be.calledWith('oldRoomId');
    });

    it('should not unsubscribe if there is no old roomId', async () => {
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);

      await observer.resubscribe('index', 'collection');

      should(sdk.realtime.unsubscribe).not.be.called();
    });

    it('should do nothing if there is no documents for this collection', async () => {
      await observer.resubscribe('index', 'collection');

      should(sdk.realtime.subscribe).not.be.called();
      should(sdk.realtime.unsubscribe).not.be.called();
    });
  });

  describe('#notificationHandler', () => {
    it('should mutate the target realtime document _source property', () => {
      const notification = {
        index: 'index',
        collection: 'collection',
        result: {
          _id: 'doc1',
          _source: {
            age: 28
          }
        },
        event: 'write',
      };
      observer.addDocument('index', 'collection', doc1);

      observer.notificationHandler(notification);

      const rtDoc = observer.documents.get('index:collection:doc1');
      should(rtDoc).match({
        _source: {
          name: 'doc 1',
          age: 28,
        },
        deleted: false
      });
    });

    it('should flag the realtime document as deleted and dispose it', async () => {
      sinon.stub(observer, 'resubscribe');
      const notification = {
        index: 'index',
        collection: 'collection',
        result: {
          _id: 'doc1',
        },
        event: 'delete',
      };
      observer.addDocument('index', 'collection', doc1);
      observer.addDocument('index', 'collection', doc2);
      const rtDoc = observer.documents.get('index:collection:doc1');

      await observer.notificationHandler(notification);

      should(rtDoc).match({
        _source: {
          name: 'doc 1',
        },
        deleted: true
      });
      should(observer.documents.has('index:collection:doc1')).be.false();

      const observedDocuments = observer.documentsByCollection.get('index:collection');
      should(observedDocuments.ids).be.eql(['doc2']);

      should(observer.resubscribe).be.calledWith('index', 'collection');

      // Should remove the empty observedDocuments for the collection
      notification.result._id = 'doc2';

      await observer.notificationHandler(notification);

      should(observer.documentsByCollection.has('index:collection')).be.false();
    });

    it('should do nothing on publish event', () => {
      const notification = {
        index: 'index',
        collection: 'collection',
        result: {
          _id: 'doc1',
          _source: {
            age: 28,
          }
        },
        event: 'publish',
      };
      observer.addDocument('index', 'collection', doc1);

      observer.notificationHandler(notification);

      const rtDoc = observer.documents.get('index:collection:doc1');
      should(rtDoc).match({
        _source: {
          name: 'doc 1',
        },
        deleted: false
      });
    });
  });
});
