const
  BulkController = require('../../src/controllers/bulk'),
  sinon = require('sinon'),
  should = require('should');

describe('Bulk Controller', () => {
  const options = {opt: 'in'};

  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };
    kuzzle.bulk = new BulkController(kuzzle);
  });

  describe('import', () => {
    it('should call bulk/import query with the bulk data and return a Promise which resolves json object', () => {
      kuzzle.query.resolves({
        result: {
          items: [
            { create: { _id: 'foo' }, status: 200 },
            { update: { _id: 'bar' }, status: 200 }
          ],
          errors: false
        }
      });

      const bulkData = {foo: 'bar'};

      return kuzzle.bulk.import(bulkData, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: { bulkData },
              controller: 'bulk',
              action: 'import'
            }, options);

          should(res.items).match([
            { create: { _id: 'foo' }, status: 200 },
            { update: { _id: 'bar' }, status: 200 }
          ]);
          should(res.errors).be.eql(false);
        });
    });
  });
});
