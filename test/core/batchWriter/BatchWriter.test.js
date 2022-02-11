const sinon = require('sinon');
const should = require('should');

const { BatchWriter } = require('../../../src/core/batchWriter/BatchWriter');

describe('BatchWriter', () => {
  /**
   * @type {BatchWriter}
   */
  let writer;
  let sdk;

  beforeEach(() => {
    sdk = {
      document: {
        mCreate: sinon.stub().resolves(),
        mCreateOrReplace: sinon.stub().resolves(),
      }
    };

    writer = new BatchWriter(sdk);
  });

  describe('#execute', () => {
    it('should call send methods with a copy of buffers', done => {
      sinon.stub(writer, 'sendCreateBuffer').resolves();
      sinon.stub(writer, 'sendUpdateBuffer').resolves();
      sinon.stub(writer, 'sendCreateOrReplaceBuffer').resolves();
      sinon.stub(writer, 'sendDeleteBuffer').resolves();
      sinon.stub(writer, 'sendExistsBuffer').resolves();
      sinon.stub(writer, 'sendGetBuffer').resolves();
      sinon.stub(writer, 'sendReplaceBuffer').resolves();
      writer.buffers.create.add('city', 'minsk', { name: 'Dana' }, 'dana');

      writer.execute()
        .then(() => {
          const buffer = writer.sendCreateBuffer.getCall(0).args[0];

          should(buffer.indexes.get('city').get('minsk').documents).be.eql([{
            _id: 'dana',
            body: { name: 'Dana' }
          }]);
          should(writer.sendCreateBuffer).be.calledOnce();
          should(writer.sendUpdateBuffer).be.calledOnce();
          should(writer.sendCreateOrReplaceBuffer).be.calledOnce();
          should(writer.sendDeleteBuffer).be.calledOnce();
          should(writer.sendExistsBuffer).be.calledOnce();
          should(writer.sendGetBuffer).be.calledOnce();
          should(writer.sendReplaceBuffer).be.calledOnce();

          done();
        })
        .catch(error => done(error));

      writer.buffers.create.add('city', 'minsk', { name: 'Aschen' }, 'aschen');
    });
  });

  describe('#begin', () => {
    it('should reset buffers and start execution interval', done => {
      sinon.stub(writer, 'execute').resolves();
      writer.buffers.create.add('city', 'minsk', { name: 'Dana' }, 'dana');

      writer.begin();

      setTimeout(() => {
        should(writer.buffers.create.indexes.size).be.eql(0);

        should(writer.execute).be.calledOnce();

        clearInterval(writer.timer);

        done();
      }, writer.interval + 1);
    });
  });

  describe('#dispose', () => {
    it('should send remaining buffers and stop timer', async () => {
      sinon.stub(writer, 'execute').resolves();

      await writer.dispose();

      should(writer.execute).be.calledOnce();
      should(writer.timer).be.null();
    });
  });

  describe('#prepapre')
});
