const
  CollectionController = require('../../src/controllers/collection'),
  SpecificationsSearchResult = require('../../src/controllers/searchResult/specifications'),
  sinon = require('sinon'),
  should = require('should');

describe('collection', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };
    kuzzle.collection = new CollectionController(kuzzle);
  });

  it('create', () => {
    return kuzzle.collection.create('index', 'collection', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'collection',
            action: 'create',
            index: 'index',
            collection: 'collection'
          }, options);
      });
  });

  it('deleteSpecifications', () => {
    return kuzzle.collection.deleteSpecification('index', 'collection', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'collection',
            action: 'deleteSpecification',
            index: 'index',
            collection: 'collection'
          }, options);
      });

  });

  it('exists', () => {
    return kuzzle.collection.exists('index', 'collection', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'collection',
            action: 'exists',
            index: 'index',
            collection: 'collection'
          }, options);
      });
  });

  it('getMapping', () => {
    return kuzzle.collection.getMapping('index', 'collection', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'collection',
            action: 'getMapping',
            index: 'index',
            collection: 'collection'
          }, options);
      });
  });

  it('getSpecifications', () => {
    return kuzzle.collection.getSpecifications('index', 'collection', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'collection',
            action: 'getSpecifications',
            index: 'index',
            collection: 'collection'
          }, options);
      });
  });

  it('list', () => {
    return kuzzle.collection.list('index', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'collection',
            action: 'list',
            index: 'index',
            from: undefined,
            size: undefined
          }, options);
      });
  });

  it('searchSpecifications', () => {
    const body = {foo: 'bar'};

    return kuzzle.collection.searchSpecifications(body, {from: 3, size: 42, scroll: 'scroll'})
      .then(result => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'collection',
            action: 'searchSpecifications',
            body,
            from: 3,
            size: 42,
            scroll: 'scroll'
          });

        should(result)
          .be.an.instanceOf(SpecificationsSearchResult);
      });
  });

  it('truncate', () => {
    return kuzzle.collection.truncate('index', 'collection', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'collection',
            action: 'truncate',
            index: 'index',
            collection: 'collection'
          }, options);
      });
  });

  it('updateMapping', () => {
    const body = {foo: 'bar'};

    return kuzzle.collection.updateMapping('index', 'collection', body, options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            body,
            controller: 'collection',
            action: 'updateMapping',
            index: 'index',
            collection: 'collection'
          }, options);
      });
  });

  it('updateSpecifications', () => {
    const body = {foo: 'bar'};

    return kuzzle.collection.updateSpecifications('index', 'collection', body, options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            body,
            controller: 'collection',
            action: 'updateSpecifications',
            index: 'index',
            collection: 'collection'
          }, options);
      });
  });

  it('validateSpecifications', () => {
    const body = {foo: 'bar'};

    return kuzzle.collection.validateSpecifications(body, options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            body,
            controller: 'collection',
            action: 'validateSpecifications'
          }, options);
      });
  });
});
