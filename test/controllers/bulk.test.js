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

  describe('write', () => {
    it('should call bulk:write with the provided parameters', () => {
      kuzzle.query.resolves({
        result: {
          _id: 'liia',
          _source: {
            school: 'lfiduras'
          }
        }
      });

      const
        document = { school: 'lfiduras' },
        opts = { notify: true };

      return kuzzle.bulk.write('vietnam', 'hochiminh', document, 'liia', opts)
        .then(result => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: document,
              _id: 'liia',
              index: 'vietnam',
              collection: 'hochiminh',
              controller: 'bulk',
              action: 'write'
            }, options);

          should(result).match({
            _id: 'liia',
            _source: { school: 'lfiduras' }
          });
        });
    });
  });

  describe('mWrite', () => {
    it('should call bulk:mWrite with the provided parameters', () => {
      kuzzle.query.resolves({
        result: {
          hits: [
            {
              _id: 'liia',
              _source: { school: 'lfiduras' },
              created: true
            }
          ]
        }
      });

      const
        documents = [
          {
            _id: 'liaa',
            _source: { school: 'lfiduras' }
          }
        ],
        opts = { notify: true };

      return kuzzle.bulk.mWrite('vietnam', 'hochiminh', documents, opts)
        .then(result => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: { documents },
              index: 'vietnam',
              collection: 'hochiminh',
              controller: 'bulk',
              action: 'mWrite'
            }, options);

          should(result.hits[0]).match({
            _id: 'liia',
            _source: { school: 'lfiduras' },
            created: true
          });
        });
    });
  });
});
