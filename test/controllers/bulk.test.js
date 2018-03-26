const
  BulkController = require('../../src/controllers/bulk'),
  sinon = require('sinon'),
  should = require('should');

describe('bulk', () => {
  const options = {opt: 'in'};

  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };
    kuzzle.bulk = new BulkController(kuzzle);
  });

  it('import', () => {
    const data = {foo: 'bar'};

    return kuzzle.bulk.import(data, options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'bulk',
            action: 'import',
            body: {
              bulkData: data
            }
          }, options);
      });
  });
});
