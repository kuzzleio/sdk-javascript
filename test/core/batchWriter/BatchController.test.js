const sinon = require('sinon');
const should = require('should');

const { InstrumentablePromise } = require('../../../src/core/InstrumentablePromise');
const { BatchController } = require('../../../src/core/batchWriter/BatchController');
const { KuzzleError } = require('../../../src/KuzzleError');

describe('BatchController', () => {
  /**
   * @type {BatchController}
   */
  let batchController;
  let writer;
  let sdk = 'sdk';

  class BatchControllerTest extends BatchController {
    createWriter () {
      return writer;
    }
  }

  beforeEach(() => {
    writer = {
      begin: sinon.stub(),
      dispose: sinon.stub(),
      addCreate: sinon.stub(),
      addReplace: sinon.stub(),
      addCreateOrReplace: sinon.stub(),
      addUpdate: sinon.stub(),
      addGet: sinon.stub(),
      addExists: sinon.stub(),
      addDelete: sinon.stub(),
    };

    batchController = new BatchControllerTest(sdk);
  });

  describe('#constructor', () => {
    it('should initialise a writer', () => {
      should(batchController.writer).be.eql(writer);
      should(writer.begin).be.calledOnce();
    });
  });

  describe('#dispose', () => {
    it('should dispose the writer', async () => {
      await batchController.dispose();

      should(writer.dispose).be.calledOnce();
    });
  });

  describe('#create', () => {
    /**
     * @type {InstrumentablePromise}
     */
    let promise;

    beforeEach(() => {
      promise = new InstrumentablePromise();

      writer.addCreate
        .onCall(0).returns({ idx: 0, promise })
        .onCall(1).returns({ idx: 1, promise });
    });

    it('should add the document in the buffer and resolve promise with successes and errors', async () => {
      const prom1 = batchController.create('city', 'galle', { name: 'Dana' });
      const prom2 = batchController.create('city', 'galle', { name: 'Aschen' });

      promise.resolve({
        successes: ['dana', 'aschen'],
        errors: [],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.resolvedWith('aschen');
      should(writer.addCreate)
        .be.calledWith('city', 'galle', { name: 'Dana' })
        .be.calledWith('city', 'galle', { name: 'Aschen' });
    });

    it('should find and return the correct error', async () => {
      const prom1 = batchController.create('city', 'galle', { name: 'Dana' });
      const prom2 = batchController.create('city', 'galle', { name: 'Aschen' });

      promise.resolve({
        successes: ['dana'],
        errors: [
          {
            reason: 'some reason',
            document: { _id: 'aschen', _source: { name: 'Aschen' } },
          },
          {
            reason: 'some reason2',
            document: { _id: 'aschen2', _source: { name: 'Aschen2' } },
          },
        ],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.rejectedWith(new Error('Cannot create document in "city":"galle" : some reason'));
    });
  });

  describe('#replace', () => {
    /**
     * @type {InstrumentablePromise}
     */
    let promise;

    beforeEach(() => {
      promise = new InstrumentablePromise();

      writer.addReplace
        .onCall(0).returns({ idx: 0, promise })
        .onCall(1).returns({ idx: 1, promise });
    });

    it('should add the document in the buffer and resolve promise with successes and errors', async () => {
      const prom1 = batchController.replace('city', 'galle', { name: 'Dana' }, 'dana');
      const prom2 = batchController.replace('city', 'galle', { name: 'Aschen' }, 'aschen');

      promise.resolve({
        successes: ['dana', 'aschen'],
        errors: [],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.resolvedWith('aschen');
      should(writer.addReplace)
        .be.calledWith('city', 'galle', 'dana', { name: 'Dana' }, undefined)
        .be.calledWith('city', 'galle', 'aschen', { name: 'Aschen' }, undefined);
    });

    it('should find and return the correct error', async () => {
      const prom1 = batchController.replace('city', 'galle', { name: 'Dana' }, 'dana');
      const prom2 = batchController.replace('city', 'galle', { name: 'Aschen' }, 'aschen');

      promise.resolve({
        successes: ['dana'],
        errors: [
          {
            reason: 'some reason',
            document: { _id: 'aschen', _source: { name: 'Aschen' } },
          },
          {
            reason: 'some reason2',
            document: { _id: 'aschen2', _source: { name: 'Aschen2' } },
          },
        ],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.rejectedWith(new Error('Cannot replace document in "city":"galle" : some reason'));
    });
  });

  describe('#createOrReplace', () => {
    /**
     * @type {InstrumentablePromise}
     */
    let promise;

    beforeEach(() => {
      promise = new InstrumentablePromise();

      writer.addCreateOrReplace
        .onCall(0).returns({ idx: 0, promise })
        .onCall(1).returns({ idx: 1, promise });
    });

    it('should add the document in the buffer and resolve promise with successes and errors', async () => {
      const prom1 = batchController.createOrReplace('city', 'galle', { name: 'Dana' }, 'dana');
      const prom2 = batchController.createOrReplace('city', 'galle', { name: 'Aschen' }, 'aschen');

      promise.resolve({
        successes: ['dana', 'aschen'],
        errors: [],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.resolvedWith('aschen');
      should(writer.addCreateOrReplace)
        .be.calledWith('city', 'galle', 'dana', { name: 'Dana' }, undefined)
        .be.calledWith('city', 'galle', 'aschen', { name: 'Aschen' }, undefined);
    });

    it('should find and return the correct error', async () => {
      const prom1 = batchController.createOrReplace('city', 'galle', { name: 'Dana' }, 'dana');
      const prom2 = batchController.createOrReplace('city', 'galle', { name: 'Aschen' }, 'aschen');

      promise.resolve({
        successes: ['dana'],
        errors: [
          {
            reason: 'some reason',
            document: { _id: 'aschen', _source: { name: 'Aschen' } },
          },
          {
            reason: 'some reason2',
            document: { _id: 'aschen2', _source: { name: 'Aschen2' } },
          },
        ],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.rejectedWith(new Error('Cannot create or replace document in "city":"galle" : some reason'));
    });
  });

  describe('#update', () => {
    /**
     * @type {InstrumentablePromise}
     */
    let promise;

    beforeEach(() => {
      promise = new InstrumentablePromise();

      writer.addUpdate
        .onCall(0).returns({ idx: 0, promise })
        .onCall(1).returns({ idx: 1, promise });
    });

    it('should add the document in the buffer and resolve promise with successes and errors', async () => {
      const prom1 = batchController.update('city', 'galle', { name: 'Dana' }, 'dana');
      const prom2 = batchController.update('city', 'galle', { name: 'Aschen' }, 'aschen');

      promise.resolve({
        successes: ['dana', 'aschen'],
        errors: [],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.resolvedWith('aschen');
      should(writer.addUpdate)
        .be.calledWith('city', 'galle', 'dana', { name: 'Dana' }, undefined)
        .be.calledWith('city', 'galle', 'aschen', { name: 'Aschen' }, undefined);
    });

    it('should find and return the correct error', async () => {
      const prom1 = batchController.update('city', 'galle', { name: 'Dana' }, 'dana');
      const prom2 = batchController.update('city', 'galle', { name: 'Aschen' }, 'aschen');

      promise.resolve({
        successes: ['dana'],
        errors: [
          {
            reason: 'some reason',
            document: { _id: 'aschen', _source: { name: 'Aschen' } },
          },
          {
            reason: 'some reason2',
            document: { _id: 'aschen2', _source: { name: 'Aschen2' } },
          },
        ],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.rejectedWith(new Error('Cannot update in "city":"galle" : some reason'));
    });
  });

  describe('#get', () => {
    /**
     * @type {InstrumentablePromise}
     */
    let promise;

    beforeEach(() => {
      promise = new InstrumentablePromise();

      writer.addGet
        .onCall(0).returns({ idx: 0, promise })
        .onCall(1).returns({ idx: 1, promise });
    });

    it('should add the document in the buffer and resolve promise with successes and errors', async () => {
      const prom1 = batchController.get('city', 'galle', 'dana');
      const prom2 = batchController.get('city', 'galle', 'aschen');

      promise.resolve({
        successes: ['dana', 'aschen'],
        errors: [],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.resolvedWith('aschen');
      should(writer.addGet)
        .be.calledWith('city', 'galle', undefined, 'dana')
        .be.calledWith('city', 'galle', undefined, 'aschen');
    });

    it('should find and return the correct error', async () => {
      const prom1 = batchController.get('city', 'galle', 'dana');
      const prom2 = batchController.get('city', 'galle', 'aschen');

      promise.resolve({
        successes: ['dana'],
        errors: [
          {
            reason: 'some reason',
            document: { _id: 'aschen', _source: { name: 'Aschen' } },
          },
          {
            reason: 'some reason2',
            document: { _id: 'aschen2', _source: { name: 'Aschen2' } },
          },
        ],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.rejectedWith(new KuzzleError({
        message: 'Document "city":"galle":"aschen" not found',
        id: 'services.storage.not_found'
      }));
    });
  });

  describe('#exists', () => {
    /**
     * @type {InstrumentablePromise}
     */
    let promise;

    beforeEach(() => {
      promise = new InstrumentablePromise();

      writer.addExists
        .onCall(0).returns({ idx: 0, promise })
        .onCall(1).returns({ idx: 1, promise });
    });

    it('should add the document in the buffer and resolve promise with successes and errors', async () => {
      const prom1 = batchController.exists('city', 'galle', 'dana');
      const prom2 = batchController.exists('city', 'galle', 'aschen');

      promise.resolve({
        successes: [true, false],
        errors: [],
      });

      should(prom1).be.resolvedWith(true);
      should(prom2).be.resolvedWith(false);
      should(writer.addExists)
        .be.calledWith('city', 'galle', undefined, 'dana')
        .be.calledWith('city', 'galle', undefined, 'aschen');
    });
  });

  describe('#delete', () => {
    /**
     * @type {InstrumentablePromise}
     */
    let promise;

    beforeEach(() => {
      promise = new InstrumentablePromise();

      writer.addDelete
        .onCall(0).returns({ idx: 0, promise })
        .onCall(1).returns({ idx: 1, promise });
    });

    it('should add the document in the buffer and resolve promise with successes and errors', async () => {
      const prom1 = batchController.delete('city', 'galle', 'dana');
      const prom2 = batchController.delete('city', 'galle', 'aschen');

      promise.resolve({
        successes: ['dana', 'aschen'],
        errors: [],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.resolvedWith('aschen');
      should(writer.addDelete)
        .be.calledWith('city', 'galle', undefined, 'dana')
        .be.calledWith('city', 'galle', undefined, 'aschen');
    });

    it('should find and return the correct error', async () => {
      const prom1 = batchController.delete('city', 'galle', 'dana');
      const prom2 = batchController.delete('city', 'galle', 'aschen');

      promise.resolve({
        successes: ['dana'],
        errors: [
          {
            reason: 'some reason',
            document: { _id: 'aschen', _source: { name: 'Aschen' } },
          },
          {
            reason: 'some reason2',
            document: { _id: 'aschen2', _source: { name: 'Aschen2' } },
          },
        ],
      });

      should(prom1).be.resolvedWith('dana');
      should(prom2).be.rejectedWith(new Error('Cannot delete document "city":"galle":aschen": some reason'));
    });
  });
});
