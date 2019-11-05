const
  IndexController = require('../../src/controllers/index'),
  sinon = require('sinon'),
  should = require('should');

describe('Index Controller', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };
    kuzzle.index = new IndexController(kuzzle);
  });

  describe('create', () => {
    it('should call index/create query and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({
        result: {
          acknowledged: true,
          shards_acknowledged: true
        }
      });

      return kuzzle.index.create('index', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'create',
              index: 'index'
            }, options);

          should(res.acknowledged).be.a.Boolean().and.be.true();
          should(res.shards_acknowledged).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('delete', () => {
    it('should call index/delete query and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({
        result: {acknowledged: true}
      });

      return kuzzle.index.delete('index', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'delete',
              index: 'index'
            }, options);

          should(res).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('exists', () => {
    it('should call index/exists query and return a Promise which resolves a boolean', () => {
      kuzzle.query.resolves({result: true});

      return kuzzle.index.exists('index', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'exists',
              index: 'index'
            }, options);

          should(res).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('getAutoRefresh', () => {
    it('should call index/getAutoRefresh query and return a Promise which resolves a boolean', () => {
      kuzzle.query.resolves({result: true});

      return kuzzle.index.getAutoRefresh('index', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'getAutoRefresh',
              index: 'index'
            }, options);

          should(res).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('list', () => {
    it('should call index/list query and return a Promise which resolves the list of available indexes', () => {
      const result = {
        indexes: ['foo', 'bar', 'baz']
      };
      kuzzle.query.resolves({result});

      return kuzzle.index.list(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'list'
            }, options);

          should(res).be.equal(result.indexes);
        });
    });
  });

  describe('mDelete', () => {
    it('should call index/mDelete query and return a Promise which resolves the list of deleted indexes', () => {
      const result = {
        deleted: ['foo', 'bar']
      };
      kuzzle.query.resolves({result});

      return kuzzle.index.mDelete(['foo', 'bar'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'mDelete',
              body: {indexes: ['foo', 'bar']}
            }, options);

          should(res).be.equal(result.deleted);
        });
    });
  });

  describe('refresh', () => {
    it('should call index/refresh query and return a Promise which resolves an acknowledgement', () => {
      const result = {
        _shards: {
          failed: 0,
          succressful: 5,
          total: 10
        }
      };
      kuzzle.query.resolves({result});

      return kuzzle.index.refresh('index', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'refresh',
              index: 'index'
            }, options);

          should(res).be.equal(result._shards);
        });
    });
  });

  describe('refreshInternal', () => {
    it('should call index/refreshInternal query and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({
        result: {acknowledged: true}
      });

      return kuzzle.index.refreshInternal(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'refreshInternal'
            }, options);

          should(res).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('setAutoRefresh', () => {
    it('should call index/setAutoRefresh query to enable autorefresh and return a Promise which resolves true', () => {
      kuzzle.query.resolves({result: { response: true }});

      return kuzzle.index.setAutoRefresh('index', true, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'setAutoRefresh',
              index: 'index',
              body: {autoRefresh: true}
            }, options);

          should(res).be.a.Boolean().and.be.true();
        });
    });

    it('should call index/setAutoRefresh query to disable autorefresh and return a Promise which resolves false', () => {
      kuzzle.query.resolves({result: { response: false }});

      return kuzzle.index.setAutoRefresh('index', false, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'index',
              action: 'setAutoRefresh',
              index: 'index',
              body: {autoRefresh: false}
            }, options);

          should(res).be.a.Boolean().and.be.false();
        });
    });
  });
});
