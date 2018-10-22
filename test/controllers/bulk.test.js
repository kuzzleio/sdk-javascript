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
      kuzzle.query.resolves({result: {hits: [
        {create: {_id: 'foo'}, status: 200},
        {update: {_id: 'bar'}, status: 200}
      ]}});

      const data = {foo: 'bar'};

      return kuzzle.bulk.import(data, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: {bulkData: data},
              controller: 'bulk',
              action: 'import'
            }, options);

          should(res).match([
            {create: {_id: 'foo'}, status: 200},
            {update: {_id: 'bar'}, status: 200}
          ]);
        });
    });
  });
});
