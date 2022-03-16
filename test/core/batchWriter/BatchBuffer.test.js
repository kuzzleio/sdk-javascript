const should = require('should');

const { BatchBuffer } = require('../../../src/core/batchWriter/BatchBuffer');
const { InstrumentablePromise } = require('../../../src/core/InstrumentablePromise');

describe('BatchBuffer', () => {
  /**
   * @type {BatchBuffer}
   */
  let buffer;
  let doc;
  let opts;

  beforeEach(() => {
    buffer = new BatchBuffer();

    doc = { name: 'Dana', age: 31 };

    opts = { flag: true };
  });

  describe('#add', () => {
    it('should initialize index buffer', () => {
      buffer.add('city', 'minsk', doc, 'dana', opts);

      const index = buffer.indexes.get('city');
      should(index).not.be.undefined();
      const docBuffer = index.get('minsk');
      should(docBuffer).not.be.undefined();
      should(docBuffer.documents).be.eql([{
        _id: 'dana',
        body: doc
      }]);
      should(docBuffer.promise).be.instanceOf(InstrumentablePromise);
      should(docBuffer.options).be.eql(opts);
    });

    it('should add document to existing buffer and return doc index', () => {
      buffer.add('city', 'minsk', doc, 'dana');

      const ret = buffer.add('city', 'minsk', { name: 'Aschen' }, 'aschen');

      should(ret.idx).be.eql(1);
      const docBuffer = buffer.indexes.get('city').get('minsk');
      should(ret.promise).be.eql(docBuffer.promise);
      should(docBuffer.documents).be.eql([
        {
          _id: 'dana',
          body: doc
        },
        {
          _id: 'aschen',
          body: { name: 'Aschen' }
        }
      ]);
    });
  });
});
