const
  DocumentController = require('../../src/controllers/document'),
  DocumentSearchResult = require('../../src/controllers/searchResult/document'),
  sinon = require('sinon'),
  should = require('should');

describe('Document Controller', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };
    kuzzle.document = new DocumentController(kuzzle);
  });

  describe('count', () => {
    it('should call document/count query and return a Promise which resolves a numeric value', () => {
      kuzzle.query.resolves({result: {count: 1234}});

      return kuzzle.document.count('index', 'collection', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'count',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              includeTrash: undefined
            }, options);

          should(res).be.a.Number().and.be.equal(1234);
        });
    });

    it('should inject the "includeTrash" option into the request', () => {
      kuzzle.query.resolves({result: {count: 1234}});

      return kuzzle.document.count('index', 'collection', {foo: 'bar'}, {includeTrash: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'count',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              includeTrash: true
            }, {});

          should(res).be.a.Number().and.be.equal(1234);
        });
    });
  });

  describe('create', () => {
    it('should call document/create query and return a Promise which resolves the created document', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'}
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.create('index', 'collection', {foo: 'bar'}, 'document-id', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'create',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'}
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.create('index', 'collection', {foo: 'bar'}, 'document-id', {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'create',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('createOrReplace', () => {
    it('should call document/createOrReplace query and return a Promise which resolves an acknowledgement', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'},
        created: false
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.createOrReplace('index', 'collection', 'document-id', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'createOrReplace',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'},
        created: false
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.createOrReplace('index', 'collection', 'document-id', {foo: 'bar'}, {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'createOrReplace',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('delete', () => {
    it('should call document/delete query and return a Promise which resolves the id of the deleted document', () => {
      kuzzle.query.resolves({result: {_id: 'document-id'}});

      return kuzzle.document.delete('index', 'collection', 'document-id', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'delete',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              refresh: undefined
            }, options);

          should(res).equal('document-id');
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({result: {_id: 'document-id'}});

      return kuzzle.document.delete('index', 'collection', 'document-id', {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'delete',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              refresh: true
            }, {});

          should(res).equal('document-id');
        });
    });
  });

  describe('deleteByQuery', () => {
    it('should call document/deleteByQuery query and return a Promise which resolves the list of deleted document ids', () => {
      kuzzle.query.resolves({result: {ids: ['foo', 'bar', 'baz']}});

      return kuzzle.document.deleteByQuery('index', 'collection', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'deleteByQuery',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              refresh: undefined
            }, options);

          should(res).be.an.Array();
          should(res.length).be.equal(3);
          should(res[0]).be.equal('foo');
          should(res[1]).be.equal('bar');
          should(res[2]).be.equal('baz');
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({result: {ids: ['foo', 'bar', 'baz']}});

      return kuzzle.document.deleteByQuery('index', 'collection', {foo: 'bar'}, {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'deleteByQuery',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              refresh: true
            }, {});

          should(res).be.an.Array();
          should(res.length).be.equal(3);
          should(res[0]).be.equal('foo');
          should(res[1]).be.equal('bar');
          should(res[2]).be.equal('baz');
        });
    });
  });

  describe('get', () => {
    it('should call document/get query and return a Promise which resolves the document', () => {
      kuzzle.query.resolves({
        result: {
          _id: 'document-id',
          _index: 'index',
          _type: 'collection',
          _source: {foo: 'bar'}
        }
      });

      return kuzzle.document.get('index', 'collection', 'document-id', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'get',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              includeTrash: undefined
            }, options);

          should(res._id).be.equal('document-id');
          should(res._index).be.equal('index');
          should(res._type).be.equal('collection');
          should(res._source.foo).be.equal('bar');
        });
    });

    it('should inject the "includeTrash" option into the request', () => {
      kuzzle.query.resolves({
        result: {
          _id: 'document-id',
          _index: 'index',
          _type: 'collection',
          _source: {foo: 'bar'}
        }
      });

      return kuzzle.document.get('index', 'collection', 'document-id', {includeTrash: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'get',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              includeTrash: true
            }, {});

          should(res._id).be.equal('document-id');
          should(res._index).be.equal('index');
          should(res._type).be.equal('collection');
          should(res._source.foo).be.equal('bar');
        });
    });
  });

  describe('mCreate', () => {
    it('should call document/mCreate query and return a Promise which resolves the created documents', () => {
      const result = {
        hits: [{
          _id: 'document-id',
          _version: 1,
          _source: {foo: 'bar'}
        }],
        total: 1
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mCreate('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mCreate',
              index: 'index',
              collection: 'collection',
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = {
        hits: [{
          _id: 'document-id',
          _version: 1,
          _source: {foo: 'bar'}
        }],
        total: 1
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mCreate('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mCreate',
              index: 'index',
              collection: 'collection',
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('mCreateOrReplace', () => {
    it('should call document/mCreateOrReplace query and return a Promise which resolves the created documents', () => {
      const result = {
        hits: [{
          _id: 'document-id',
          _version: 1,
          _source: {foo: 'bar'}
        }],
        total: 1
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mCreateOrReplace('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mCreateOrReplace',
              index: 'index',
              collection: 'collection',
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = {
        hits: [{
          _id: 'document-id',
          _version: 1,
          _source: {foo: 'bar'}
        }],
        total: 1
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mCreateOrReplace('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mCreateOrReplace',
              index: 'index',
              collection: 'collection',
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('mDelete', () => {
    it('should call document/mDelete query and return a Promise which resolves the list of deleted documents ids', () => {
      const result = ['document1', 'document2'];
      kuzzle.query.resolves({result});

      return kuzzle.document.mDelete('index', 'collection', ['document1', 'document2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mDelete',
              index: 'index',
              collection: 'collection',
              body: {ids: ['document1', 'document2']},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = ['document1', 'document2'];
      kuzzle.query.resolves({result});

      return kuzzle.document.mDelete('index', 'collection', ['document1', 'document2'], {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mDelete',
              index: 'index',
              collection: 'collection',
              body: {ids: ['document1', 'document2']},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('mGet', () => {
    it('should call document/mGet query and return a Promise which resolves the list of documents', () => {
      const result = {
        hits: [
          {_id: 'document1', _version: 1, _source: {foo: 'bar'}},
          {_id: 'document2', _version: 3, _source: {foo: 'baz'}}
        ],
        total: 2
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mGet('index', 'collection', ['document1', 'document2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mGet',
              index: 'index',
              collection: 'collection',
              body: {ids: ['document1', 'document2']},
              includeTrash: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "includeTrash" option into the request', () => {
      const result = {
        hits: [
          {_id: 'document1', _version: 1, _source: {foo: 'bar'}},
          {_id: 'document2', _version: 3, _source: {foo: 'baz'}},
        ],
        total: 2
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mGet('index', 'collection', ['document1', 'document2'], {includeTrash: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mGet',
              index: 'index',
              collection: 'collection',
              body: {ids: ['document1', 'document2']},
              includeTrash: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('mReplace', () => {
    it('should call document/mReplace query and return a Promise which resolves the replaced documents', () => {
      const result = {
        hits: [{
          _id: 'document-id',
          _version: 1,
          _source: {foo: 'bar'}
        }],
        total: 1
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mReplace('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mReplace',
              index: 'index',
              collection: 'collection',
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = {
        hits: [{
          _id: 'document-id',
          _version: 1,
          _source: {foo: 'bar'}
        }],
        total: 1
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mReplace('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mReplace',
              index: 'index',
              collection: 'collection',
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('mUpdate', () => {
    it('should call document/mUpdate query and return a Promise which resolves the updated documents', () => {
      const result = {
        hits: [{
          _id: 'document-id',
          _version: 1,
          _source: {foo: 'bar'}
        }],
        total: 1
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mUpdate('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mUpdate',
              index: 'index',
              collection: 'collection',
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = {
        hits: [{
          _id: 'document-id',
          _version: 1,
          _source: {foo: 'bar'}
        }],
        total: 1
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.mUpdate('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mUpdate',
              index: 'index',
              collection: 'collection',
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('replace', () => {
    it('should call document/replace query and return a Promise which resolves the updated document', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'},
        created: false
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.replace('index', 'collection', 'document-id', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'replace',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'},
        created: false
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.replace('index', 'collection', 'document-id', {foo: 'bar'}, {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'replace',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('search', () => {
    it('should call document/search query and return a Promise which resolves a DocumentSearchResult instance', () => {
      const result = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'document1', _score: 0.9876, _source: {foo: 'bar'}},
          {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar'}},
          {_id: 'document3', _score: 0.6543, _source: {foo: 'barbaz'}}
        ],
        total: 3
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.search('index', 'collection', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'search',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              from: 0,
              size: 10,
              scroll: undefined,
              includeTrash: undefined
            }, options);

          should(res).be.an.instanceOf(DocumentSearchResult);
          should(res._options).be.equal(options);
          should(res._response).be.equal(result);
          should(res.fetched).be.equal(3);
          should(res.total).be.equal(3);
        });
    });

    it('should inject the "includeTrash" option into the request', () => {
      const result = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'document1', _score: 0.9876, _source: {foo: 'bar'}},
          {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar'}},
          {_id: 'document3', _score: 0.6543, _source: {foo: 'barbaz'}}
        ],
        total: 3
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.search('index', 'collection', {foo: 'bar'}, {includeTrash: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'search',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              from: 0,
              size: 10,
              scroll: undefined,
              includeTrash: true
            }, {});

          should(res).be.an.instanceOf(DocumentSearchResult);
          should(res._options).be.empty();
          should(res._response).be.equal(result);
          should(res.fetched).be.equal(3);
          should(res.total).be.equal(3);
        });
    });

    it('should inject the "from", "size", "scroll" options into the request', () => {
      const result = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar'}},
          {_id: 'document3', _score: 0.6543, _source: {foo: 'barbaz'}}
        ],
        total: 3
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.search('index', 'collection', {foo: 'bar'}, {from: 1, size: 2, scroll: '1m'})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'search',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              from: 1,
              size: 2,
              scroll: '1m',
              includeTrash: undefined
            }, {});

          should(res).be.an.instanceOf(DocumentSearchResult);
          should(res._options).be.empty();
          should(res._response).be.equal(result);
          should(res.fetched).be.equal(2);
          should(res.total).be.equal(3);
        });
    });

    it('should set default value for from and size', () => {
      const result = {
        hits: [],
        total: 0
      };
      kuzzle.document.query = sinon.stub().resolves({result});

      return kuzzle.document.search('index', 'collection', {})
        .then(() => {
          should(kuzzle.document.query).be.calledOnce();

          const request = kuzzle.document.query.getCall(0).args[0];
          should(request.from).be.eql(0);
          should(request.size).be.eql(10);
        });
    });

    it.only('should allow to set value of 0 for size', () => {
      const result = {
        hits: [],
        total: 0
      };
      kuzzle.document.query = sinon.stub().resolves({result});

      return kuzzle.document.search('index', 'collection', {}, { size: 0 })
        .then(() => {
          should(kuzzle.document.query).be.calledOnce();

          const request = kuzzle.document.query.getCall(0).args[0];
          should(request.from).be.eql(0);
          should(request.size).be.eql(0);
        });
    });

    it('should not set default value for from if scroll or sort are specified', () => {
      const result = {
        hits: [],
        total: 0
      };
      kuzzle.document.query = sinon.stub().resolves({result});

      return kuzzle.document.search('index', 'collection', {}, { scroll: '42s' })
        .then(() => {
          should(kuzzle.document.query).be.calledOnce();

          const request = kuzzle.document.query.getCall(0).args[0];
          should(request.from).be.undefined();

          return kuzzle.document.search('index', 'collection', { sort: { some: 'thing' }});
        })
        .then(() => {
          should(kuzzle.document.query).be.calledTwice();

          const request = kuzzle.document.query.getCall(1).args[0];
          should(request.from).be.undefined();
        });
    });
  });

  describe('update', () => {
    it('should call document/update query and return a Promise which resolves the updated document', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'},
        created: false
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.update('index', 'collection', 'document-id', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'update',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: undefined,
              retryOnConflict: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'},
        created: false
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.update('index', 'collection', 'document-id', {foo: 'bar'}, {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'update',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: true,
              retryOnConflict: undefined
            }, {});

          should(res).be.equal(result);
        });
    });

    it('should inject the "retryOnConflict" option into the request', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: {foo: 'bar'},
        created: false
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.update('index', 'collection', 'document-id', {foo: 'bar'}, {retryOnConflict: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'update',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {foo: 'bar'},
              refresh: undefined,
              retryOnConflict: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('validate', () => {
    it('should call document/validate query and return a Promise which resolves the validation result', () => {
      const result = {
        errorMessages: {},
        valid: true
      };
      kuzzle.query.resolves({result});

      return kuzzle.document.validate('index', 'collection', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'validate',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'}
            }, options);

          should(res).be.equal(result);
        });
    });
  });
});
