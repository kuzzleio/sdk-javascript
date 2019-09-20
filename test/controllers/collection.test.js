const
  CollectionController = require('../../src/controllers/collection'),
  SpecificationsSearchResult = require('../../src/controllers/searchResult/specifications'),
  sinon = require('sinon'),
  should = require('should');

describe('Collection Controller', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };
    kuzzle.collection = new CollectionController(kuzzle);
  });

  describe('create', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.create(null, 'collection', null, options);
      }).throw('Kuzzle.collection.create: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.create('index', null, null, options);
      }).throw('Kuzzle.collection.create: collection is required');
    });

    it('should call collection/create query and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({result: {acknowledged: true}});

      return kuzzle.collection.create('index', 'collection', null, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'create',
              body: null,
              index: 'index',
              collection: 'collection'
            }, options);

          should(res.acknowledged).be.a.Boolean().and.be.true();
        });
    });

    it('should handle a collection mapping, if one is provided', () => {
      kuzzle.query.resolves({result: {acknowledged: true}});

      return kuzzle.collection.create('index', 'collection', {properties: true}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'create',
              body: {properties: true},
              index: 'index',
              collection: 'collection'
            }, options);

          should(res.acknowledged).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('deleteSpecificationss', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.deleteSpecifications(undefined, 'collection', options);
      }).throw('Kuzzle.collection.deleteSpecifications: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.deleteSpecifications('index', undefined, options);
      }).throw('Kuzzle.collection.deleteSpecifications: collection is required');
    });

    it('should call collection/deleteSpecifications query and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({result: {acknowledged: true}});

      return kuzzle.collection.deleteSpecifications('index', 'collection', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'deleteSpecifications',
              index: 'index',
              collection: 'collection'
            }, options);

          should(res.acknowledged).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('exists', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.exists(undefined, 'collection', options);
      }).throw('Kuzzle.collection.exists: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.exists('index', undefined, options);
      }).throw('Kuzzle.collection.exists: collection is required');
    });

    it('should call collection/exists query names and return a Promise which resolves a boolean', () => {
      kuzzle.query.resolves({result: true});

      return kuzzle.collection.exists('index', 'collection', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'exists',
              index: 'index',
              collection: 'collection'
            }, options);

          should(res).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('refresh', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.refresh(undefined, 'collection', options);
      }).throw('Kuzzle.collection.refresh: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.refresh('index', undefined, options);
      }).throw('Kuzzle.collection.refresh: collection is required');
    });

    it('should call collection/refresh query names and return a Promise which resolves a boolean', () => {
      kuzzle.query.resolves({result: null});

      return kuzzle.collection.refresh('index', 'collection', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'refresh',
              index: 'index',
              collection: 'collection'
            }, options);

          should(res).be.Null();
        });
    });
  });

  describe('getMapping', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.getMapping(undefined, 'collection', options);
      }).throw('Kuzzle.collection.getMapping: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.getMapping('index', undefined, options);
      }).throw('Kuzzle.collection.getMapping: collection is required');
    });

    it('should call collection/getMapping query and return a Promise which resolves a json object', () => {
      kuzzle.query.resolves({
        result: {
          index: {
            mappings: {
              collection: {
                properties: {
                  field1: {type: 'foo'},
                  field2: {type: 'bar'}
                }
              }
            }
          }
        }
      });

      return kuzzle.collection.getMapping('index', 'collection', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'getMapping',
              index: 'index',
              collection: 'collection'
            }, options);

          should(res).match({
            index: {
              mappings: {
                collection: {
                  properties: {
                    field1: {type: 'foo'},
                    field2: {type: 'bar'}
                  }
                }
              }
            }
          });
        });
    });
  });

  describe('getSpecifications', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.getSpecifications(undefined, 'collection', options);
      }).throw('Kuzzle.collection.getSpecifications: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.getSpecifications('index', undefined, options);
      }).throw('Kuzzle.collection.getSpecifications: collection is required');
    });

    it('should call collection/getSpecifications query and return a Promise which resolves a json object', () => {
      kuzzle.query.resolves({
        result: {
          index: 'index',
          collection: 'collection',
          validation: {
            fields: {
              foobar: {type: 'integer', mandatory: true, defaultValue: 42}
            },
            strict: true
          }
        }
      });

      return kuzzle.collection.getSpecifications('index', 'collection', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'getSpecifications',
              index: 'index',
              collection: 'collection'
            }, options);

          should(res).match({
            index: 'index',
            collection: 'collection',
            validation: {
              fields: {
                foobar: {type: 'integer', mandatory: true, defaultValue: 42}
              },
              strict: true
            }
          });
        });
    });
  });

  describe('list', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.list(undefined, options);
      }).throw('Kuzzle.collection.list: index is required');
    });

    it('should call collection/list query and return a Promise which resolves collection list', () => {
      kuzzle.query.resolves({
        result: {
          collections: [
            {name: 'foo', type: 'realtime'},
            {name: 'bar', type: 'realtime'},
            {name: 'foobar', type: 'stored'},
            {name: 'barfoo', type: 'stored'}
          ]
        }
      });

      return kuzzle.collection.list('index', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'list',
              index: 'index',
              from: undefined,
              size: undefined
            }, options);

          should(res).match({
            collections: [
              {name: 'foo', type: 'realtime'},
              {name: 'bar', type: 'realtime'},
              {name: 'foobar', type: 'stored'},
              {name: 'barfoo', type: 'stored'}
            ]
          });
        });
    });
  });

  describe('searchSpecifications', () => {
    it('should call collection/searchSpecifications query with search filter and return a Promise which resolves a SpecificationsSearchResult object', () => {
      kuzzle.query.resolves({
        result: {
          hits: [
            {foo: 'bar'},
            {bar: 'foo'}
          ],
          total: 2
        }
      });

      const body = {foo: 'bar'};
      return kuzzle.collection.searchSpecifications(body, {from: 3, size: 42, scroll: 'scroll', foo: 'bar'})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'searchSpecifications',
              body,
              from: 3,
              size: 42,
              scroll: 'scroll'
            }, {foo: 'bar'});

          should(res).be.an.instanceOf(SpecificationsSearchResult);
          should(res._request).match({
            controller: 'collection',
            action: 'searchSpecifications',
            body,
            from: 3,
            size: 42,
            scroll: 'scroll'
          });
          should(res._options).match({foo: 'bar'});
          should(res._response).match({
            hits: [
              {foo: 'bar'},
              {bar: 'foo'}
            ],
            total: 2
          });
        });
    });
  });

  describe('truncate', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.truncate(undefined, 'collection', options);
      }).throw('Kuzzle.collection.truncate: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.truncate('index', undefined, options);
      }).throw('Kuzzle.collection.truncate: collection is required');
    });

    it('should call collection/truncate query and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({result: {acknowledged: true}});

      return kuzzle.collection.truncate('index', 'collection', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'collection',
              action: 'truncate',
              index: 'index',
              collection: 'collection',
              refresh: undefined
            }, options);

          should(res.acknowledged).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('updateMapping', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.updateMapping(undefined, 'collection', options);
      }).throw('Kuzzle.collection.updateMapping: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.updateMapping('index', undefined, options);
      }).throw('Kuzzle.collection.updateMapping: collection is required');
    });

    it('should call collection/updateMapping query with the new mapping and return a Promise which resolves a json object', () => {
      kuzzle.query.resolves({result: {foo: 'bar'}});

      const body = {foo: 'bar'};
      return kuzzle.collection.updateMapping('index', 'collection', body, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body,
              controller: 'collection',
              action: 'updateMapping',
              index: 'index',
              collection: 'collection'
            }, options);

          should(res).match({foo: 'bar'});
        });
    });
  });

  describe('updateSpecifications', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.collection.updateSpecifications(undefined, 'collection', options);
      }).throw('Kuzzle.collection.updateSpecifications: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.collection.updateSpecifications('index', undefined, options);
      }).throw('Kuzzle.collection.updateSpecifications: collection is required');
    });

    it('should call collection/updateSpecifications query with the new specifications and return a Promise which resolves a json object', () => {
      kuzzle.query.resolves({result: { index: { collection: {foo: 'bar'}}}});

      const specifications = {foo: 'bar'};
      return kuzzle.collection.updateSpecifications('index', 'collection', specifications, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: {
                index: {
                  collection: specifications
                }
              },
              controller: 'collection',
              action: 'updateSpecifications'
            }, options);

          should(res).match({foo: 'bar'});
        });
    });
  });

  describe('validateSpecifications', () => {
    it('should call collection/validateSpecifications query with the specifications to validate and return a Promise which resolves a json object', () => {
      kuzzle.query.resolves({
        result: {
          valid: false,
          description: 'foo bar',
          details: ['foo', 'bar']
        }
      });

      const specifications = {foo: 'bar'};
      return kuzzle.collection.validateSpecifications('index', 'collection', specifications, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: {
                index: {
                  collection: specifications
                }
              },
              controller: 'collection',
              action: 'validateSpecifications'
            }, options);

          should(res).match({
            valid: false,
            description: 'foo bar',
            details: ['foo', 'bar']
          });
        });
    });
  });
});
