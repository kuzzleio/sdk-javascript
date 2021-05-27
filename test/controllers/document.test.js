const sinon = require('sinon');
const should = require('should');

const { DocumentController } = require('../../src/controllers/Document');
const { DocumentSearchResult } = require('../../src/core/searchResult/Document');

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
              body: {foo: 'bar'}
            }, options);

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
      options.silent = true;

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
              silent: true,
              body: {foo: 'bar'}
            }, options);

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
      options.silent = true;

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
              silent: true,
              body: {foo: 'bar'}
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('delete', () => {
    it('should call document/delete query and return a Promise which resolves the id of the deleted document', () => {
      kuzzle.query.resolves({result: {_id: 'document-id'}});
      options.silent = true;

      return kuzzle.document.delete('index', 'collection', 'document-id', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'delete',
              index: 'index',
              collection: 'collection',
              silent: true,
              _id: 'document-id'
            }, options);

          should(res).equal('document-id');
        });
    });
  });

  
  describe('deleteFields', () => {
    it('should call document/deleteFields query and return a Promise which resolves the updated document', () => {
      kuzzle.query.resolves({result: {_id: 'document-id', _source: {foo: 'bar'}}});
      options.silent = true;

      const optionsCopy = Object.assign({}, options);
      optionsCopy.source = true;

      return kuzzle.document.deleteFields('index', 'collection', 'document-id', ['bar'], optionsCopy)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWithMatch({
              controller: 'document',
              action: 'deleteFields',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: {fields: ['bar']},
              silent: true,
              source: true,
            }, optionsCopy);

          should(res._id).be.equal('document-id');
          should(res._source.foo).be.equal('bar');
        });
    });
  });

  describe('deleteByQuery', () => {
    it('should call document/deleteByQuery query and return a Promise which resolves the list of deleted document ids', () => {
      kuzzle.query.resolves({result: {ids: ['foo', 'bar', 'baz']}});
      options.silent = true;

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
              lang: undefined,
              silent: true,
            }, options);

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
              _id: 'document-id'
            }, options);

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
      options.silent = true;

      return kuzzle.document.mCreate('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mCreate',
              index: 'index',
              collection: 'collection',
              silent: true,
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]}
            }, options);

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
      options.silent = true;

      return kuzzle.document.mCreateOrReplace('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mCreateOrReplace',
              index: 'index',
              collection: 'collection',
              silent: true,
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]}
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('mDelete', () => {
    it('should call document/mDelete query and return a Promise which resolves the list of deleted documents ids', () => {
      const result = ['document1', 'document2'];
      kuzzle.query.resolves({result});
      options.silent = true;

      return kuzzle.document.mDelete('index', 'collection', ['document1', 'document2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mDelete',
              index: 'index',
              collection: 'collection',
              silent: true,
              body: {ids: ['document1', 'document2']}
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('mGet', () => {
    const result = {
      hits: [
        { _id: 'document1', _version: 1, _source: { foo: 'bar' } },
        { _id: 'document2', _version: 3, _source: { foo: 'baz' } }
      ],
      total: 2
    };
    it('should call document/mGet query and return a Promise which resolves to the list of documents', () => {
      kuzzle.query.resolves({result});

      return kuzzle.document
        .mGet('index', 'collection', ['document1', 'document2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith(
              {
                controller: 'document',
                action: 'mGet',
                index: 'index',
                collection: 'collection',
                body: {ids: ['document1', 'document2']}
              },
              options);

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
      options.silent = true;

      return kuzzle.document.mReplace('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mReplace',
              index: 'index',
              collection: 'collection',
              silent: true,
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]}
            }, options);

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
      options.silent = true;

      return kuzzle.document.mUpdate('index', 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'mUpdate',
              index: 'index',
              collection: 'collection',
              silent: true,
              body: {documents: [{_id: 'document-id', body: {foo: 'bar'}}]}
            }, options);

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
      options.silent = true;

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
              silent: true,
              body: {foo: 'bar'}
            }, options);

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
      kuzzle.protocol = {};
      kuzzle.protocol.name = 'http';
      return kuzzle.document.search('index', 'collection', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWithMatch({
              controller: 'document',
              action: 'search',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              from: undefined,
              size: undefined,
              scroll: undefined
            }, options);

          should(res).be.an.instanceOf(DocumentSearchResult);
          should(res._options).match(options);
          should(res._options.verb).be.eql('POST');
          should(res._result).be.equal(result);
          should(res.fetched).be.equal(3);
          should(res.total).be.equal(3);
        });
    });

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
      kuzzle.protocol = {};
      kuzzle.protocol.name = 'http';
      options.verb = 'GET';
      return kuzzle.document.search('index', 'collection', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWithMatch({
              controller: 'document',
              action: 'search',
              index: 'index',
              collection: 'collection',
              searchBody: {foo: 'bar'},
              body: null,
              from: undefined,
              size: undefined,
              scroll: undefined
            }, options);

          should(res).be.an.instanceOf(DocumentSearchResult);
          should(res._options).match(options);
          should(res._options.verb).be.eql('GET');
          should(res._result).be.equal(result);
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
      kuzzle.protocol = {};
      kuzzle.protocol.name = 'http';
      return kuzzle.document.search('index', 'collection', {foo: 'bar'}, {from: 1, size: 2, scroll: '10s'})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWithMatch({
              controller: 'document',
              action: 'search',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              from: 1,
              size: 2,
              scroll: '10s'
            }, {});

          should(res).be.an.instanceOf(DocumentSearchResult);
          should(res._options).match({ verb: 'POST' });
          should(res._result).be.equal(result);
          should(res.fetched).be.equal(2);
          should(res.total).be.equal(3);
        });
    });

    it('should allow to set value of 0 for size', () => {
      const result = {
        hits: [],
        total: 0
      };
      kuzzle.document.query = sinon.stub().resolves({result});
      kuzzle.protocol = {};
      kuzzle.protocol.name = 'http';
      return kuzzle.document.search('index', 'collection', {}, { size: 0 })
        .then(() => {
          should(kuzzle.document.query).be.calledOnce();

          const request = kuzzle.document.query.getCall(0).args[0];
          should(request.size).be.eql(0);
        });
    });

    it('should not set default value for from if scroll or sort are specified', () => {
      const result = {
        hits: [],
        total: 0
      };
      kuzzle.document.query = sinon.stub().resolves({result});
      kuzzle.protocol = {};
      kuzzle.protocol.name = 'http';
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
      options.silent = true;

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
              retryOnConflict: undefined,
              silent: true,
              source: undefined
            }, options);

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
              retryOnConflict: true,
              source: undefined,
              silent: undefined,
            }, { retryOnConflict: true });

          should(res).be.equal(result);
        });
    });

    it('should inject the "source" option into the request', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: { foo: 'bar' },
        created: false
      };
      kuzzle.query.resolves({ result });

      return kuzzle.document.update('index', 'collection', 'document-id', { foo: 'bar' }, { source: true })
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'update',
              index: 'index',
              collection: 'collection',
              _id: 'document-id',
              body: { foo: 'bar' },
              retryOnConflict: undefined,
              source: true,
              silent: undefined,
            });

          should(res).be.equal(result);
        });
    });
  });

  describe('updateByQuery', () => {
    it('should call document/update query and return a Promise which resolves the updated document', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: { foo: 'bar' },
        created: false
      };
      kuzzle.query.resolves({ result });
      const searchQuery = {
        match: { foo: 'bar' }
      };
      const changes = {
        bar: 'foo'
      };
      options.silent = true;

      return kuzzle.document.updateByQuery('index', 'collection', searchQuery, changes, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'updateByQuery',
              index: 'index',
              collection: 'collection',
              body: {
                query: {
                  match: {foo: 'bar'}
                },
                changes: {
                  bar: 'foo'
                }
              },
              source: undefined,
              silent: true,
              lang: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "source" option into the request', () => {
      const result = {
        _id: 'document-id',
        _version: 1,
        _source: { foo: 'bar' },
        created: false
      };
      kuzzle.query.resolves({ result });
      const searchQuery = {
        match: { foo: 'bar' }
      };
      const changes = {
        bar: 'foo'
      };

      return kuzzle.document.updateByQuery('index', 'collection', searchQuery, changes, { source: true })
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'document',
              action: 'updateByQuery',
              index: 'index',
              collection: 'collection',
              body: {
                query: {
                  match: { foo: 'bar' }
                },
                changes: {
                  bar: 'foo'
                }
              },
              source: true,
              lang: undefined,
              silent: undefined,
            });

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
