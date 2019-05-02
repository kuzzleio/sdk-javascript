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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.count(undefined, 'collection', {}, options);
      }).throw('Kuzzle.document.count: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.count('index', undefined, {}, options);
      }).throw('Kuzzle.document.count: collection is required');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.create(undefined, 'collection', {foo: 'bar'}, 'document-id', options);
      }).throw('Kuzzle.document.create: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.create('index', undefined, {foo: 'bar'}, 'document-id', options);
      }).throw('Kuzzle.document.create: collection is required');
    });

    it('should throw an error if the "document" argument is not provided', () => {
      should(function () {
        kuzzle.document.create('index', 'collection', undefined, 'document-id', options);
      }).throw('Kuzzle.document.create: document is required');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.createOrReplace(undefined, 'collection', 'document-id', {foo: 'bar'}, options);
      }).throw('Kuzzle.document.createOrReplace: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.createOrReplace('index', undefined, 'document-id', {foo: 'bar'}, options);
      }).throw('Kuzzle.document.createOrReplace: collection is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.document.createOrReplace('index', 'collection', 'document-id', undefined, options);
      }).throw('Kuzzle.document.createOrReplace: body is required');
    });

    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.document.createOrReplace('index', 'collection', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.document.createOrReplace: _id is required');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.delete(undefined, 'collection', 'document-id', options);
      }).throw('Kuzzle.document.delete: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.delete('index', undefined, 'document-id', options);
      }).throw('Kuzzle.document.delete: collection is required');
    });

    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.document.delete('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.delete: _id is required');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.deleteByQuery(undefined, 'collection', {foo: 'bar'}, options);
      }).throw('Kuzzle.document.deleteByQuery: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.deleteByQuery('index', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.document.deleteByQuery: collection is required');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.get(undefined, 'collection', 'document-id', options);
      }).throw('Kuzzle.document.get: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.get('index', undefined, 'document-id', options);
      }).throw('Kuzzle.document.get: collection is required');
    });

    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.document.get('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.get: _id is required');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.mCreate(undefined, 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options);
      }).throw('Kuzzle.document.mCreate: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.mCreate('index', undefined, [{_id: 'document-id', body: {foo: 'bar'}}], options);
      }).throw('Kuzzle.document.mCreate: collection is required');
    });

    it('should throw an error if the "documents" argument is not provided', () => {
      should(function () {
        kuzzle.document.mCreate('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.mCreate: documents must be an array');
    });

    it('should throw an error if the "documents" argument is not an array', () => {
      should(function () {
        kuzzle.document.mCreate('index', 'collection', {_id: 'document-id', body: {foo: 'bar'}}, options);
      }).throw('Kuzzle.document.mCreate: documents must be an array');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.mCreateOrReplace(undefined, 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options);
      }).throw('Kuzzle.document.mCreateOrReplace: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.mCreateOrReplace('index', undefined, [{_id: 'document-id', body: {foo: 'bar'}}], options);
      }).throw('Kuzzle.document.mCreateOrReplace: collection is required');
    });

    it('should throw an error if the "documents" argument is not provided', () => {
      should(function () {
        kuzzle.document.mCreateOrReplace('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.mCreateOrReplace: documents must be an array');
    });

    it('should throw an error if the "documents" argument is not an array', () => {
      should(function () {
        kuzzle.document.mCreateOrReplace('index', 'collection', {_id: 'document-id', body: {foo: 'bar'}}, options);
      }).throw('Kuzzle.document.mCreateOrReplace: documents must be an array');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.mDelete(undefined, 'collection', ['document1', 'document2'], options);
      }).throw('Kuzzle.document.mDelete: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.mDelete('index', undefined, ['document1', 'document2'], options);
      }).throw('Kuzzle.document.mDelete: collection is required');
    });

    it('should throw an error if the "ids" argument is not provided', () => {
      should(function () {
        kuzzle.document.mDelete('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.mDelete: ids must be an array');
    });

    it('should throw an error if the "ids" argument is not an array', () => {
      should(function () {
        kuzzle.document.mDelete('index', 'collection', 'document1', options);
      }).throw('Kuzzle.document.mDelete: ids must be an array');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.mGet(undefined, 'collection', ['document1', 'document2'], options);
      }).throw('Kuzzle.document.mGet: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.mGet('index', undefined, ['document1', 'document2'], options);
      }).throw('Kuzzle.document.mGet: collection is required');
    });

    it('should throw an error if the "ids" argument is not provided', () => {
      should(function () {
        kuzzle.document.mGet('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.mGet: ids must be an array');
    });

    it('should throw an error if the "ids" argument is not an array', () => {
      should(function () {
        kuzzle.document.mGet('index', 'collection', 'document1', options);
      }).throw('Kuzzle.document.mGet: ids must be an array');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.mReplace(undefined, 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options);
      }).throw('Kuzzle.document.mReplace: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.mReplace('index', undefined, [{_id: 'document-id', body: {foo: 'bar'}}], options);
      }).throw('Kuzzle.document.mReplace: collection is required');
    });

    it('should throw an error if the "documents" argument is not provided', () => {
      should(function () {
        kuzzle.document.mReplace('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.mReplace: documents must be an array');
    });

    it('should throw an error if the "documents" argument is not an array', () => {
      should(function () {
        kuzzle.document.mReplace('index', 'collection', {_id: 'document-id', body: {foo: 'bar'}}, options);
      }).throw('Kuzzle.document.mReplace: documents must be an array');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.mUpdate(undefined, 'collection', [{_id: 'document-id', body: {foo: 'bar'}}], options);
      }).throw('Kuzzle.document.mUpdate: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.mUpdate('index', undefined, [{_id: 'document-id', body: {foo: 'bar'}}], options);
      }).throw('Kuzzle.document.mUpdate: collection is required');
    });

    it('should throw an error if the "documents" argument is not provided', () => {
      should(function () {
        kuzzle.document.mUpdate('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.mUpdate: documents must be an array');
    });

    it('should throw an error if the "documents" argument is not an array', () => {
      should(function () {
        kuzzle.document.mUpdate('index', 'collection', {_id: 'document-id', body: {foo: 'bar'}}, options);
      }).throw('Kuzzle.document.mUpdate: documents must be an array');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.replace(undefined, 'collection', 'document-id', {foo: 'bar'}, options);
      }).throw('Kuzzle.document.replace: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.replace('index', undefined, 'document-id', {foo: 'bar'}, options);
      }).throw('Kuzzle.document.replace: collection is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.document.replace('index', 'collection', 'document-id', undefined, options);
      }).throw('Kuzzle.document.replace: body is required');
    });

    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.document.replace('index', 'collection', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.document.replace: _id is required');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.search(undefined, 'collection', {}, options);
      }).throw('Kuzzle.document.search: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.search('index', undefined, {}, options);
      }).throw('Kuzzle.document.search: collection is required');
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
        })
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

          return kuzzle.document.search('index', 'collection', { sort: { some: 'thing' }})
        })
        .then(() => {
          should(kuzzle.document.query).be.calledTwice();

          const request = kuzzle.document.query.getCall(1).args[0];
          should(request.from).be.undefined();         
        });
    });
  });

  describe('update', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.update(undefined, 'collection', 'document-id', {foo: 'bar'}, options);
      }).throw('Kuzzle.document.update: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.update('index', undefined, 'document-id', {foo: 'bar'}, options);
      }).throw('Kuzzle.document.update: collection is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.document.update('index', 'collection', 'document-id', undefined, options);
      }).throw('Kuzzle.document.update: body is required');
    });

    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.document.update('index', 'collection', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.document.update: _id is required');
    });

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
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.document.validate(undefined, 'collection', {foo: 'bar'}, options);
      }).throw('Kuzzle.document.validate: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.document.validate('index', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.document.validate: collection is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.document.validate('index', 'collection', undefined, options);
      }).throw('Kuzzle.document.validate: body is required');
    });

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
