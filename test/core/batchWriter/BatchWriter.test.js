"use strict";

const sinon = require("sinon");
const should = require("should");

const { BatchWriter } = require("../../../src/core/batchWriter/BatchWriter");

describe("BatchWriter", () => {
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
        mGet: sinon.stub().resolves(),
        mDelete: sinon.stub().resolves(),
      },
    };

    writer = new BatchWriter(sdk);
  });

  describe("#execute", () => {
    it("should call send methods with a copy of buffers", (done) => {
      sinon.stub(writer, "sendCreateBuffer").resolves();
      sinon.stub(writer, "sendUpdateBuffer").resolves();
      sinon.stub(writer, "sendCreateOrReplaceBuffer").resolves();
      sinon.stub(writer, "sendDeleteBuffer").resolves();
      sinon.stub(writer, "sendExistsBuffer").resolves();
      sinon.stub(writer, "sendGetBuffer").resolves();
      sinon.stub(writer, "sendReplaceBuffer").resolves();
      writer.buffers.create.add("city", "minsk", { name: "Dana" }, "dana");

      writer
        .execute()
        .then(() => {
          const buffer = writer.sendCreateBuffer.getCall(0).args[0];

          should(buffer.indexes.get("city").get("minsk").documents).be.eql([
            {
              _id: "dana",
              body: { name: "Dana" },
            },
          ]);
          should(writer.sendCreateBuffer).be.calledOnce();
          should(writer.sendUpdateBuffer).be.calledOnce();
          should(writer.sendCreateOrReplaceBuffer).be.calledOnce();
          should(writer.sendDeleteBuffer).be.calledOnce();
          should(writer.sendExistsBuffer).be.calledOnce();
          should(writer.sendGetBuffer).be.calledOnce();
          should(writer.sendReplaceBuffer).be.calledOnce();

          done();
        })
        .catch((error) => done(error));

      writer.buffers.create.add("city", "minsk", { name: "Aschen" }, "aschen");
    });
  });

  describe("#begin", () => {
    it("should reset buffers and start execution interval", (done) => {
      sinon.stub(writer, "execute").resolves();
      writer.buffers.create.add("city", "minsk", { name: "Dana" }, "dana");

      writer.begin();

      setTimeout(() => {
        should(writer.buffers.create.indexes.size).be.eql(0);

        should(writer.execute).be.calledOnce();

        clearInterval(writer.timer);

        done();
      }, writer.interval + 1);
    });
  });

  describe("#dispose", () => {
    it("should send remaining buffers and stop timer", async () => {
      sinon.stub(writer, "execute").resolves();

      await writer.dispose();

      should(writer.execute).be.calledOnce();
      should(writer.timer).be.null();
    });
  });

  describe("#prepareRound", () => {
    it("should reset all buffers", () => {
      writer.buffers.create.add("city", "minsk", { name: "Dana" }, "dana");

      writer.prepareRound();

      should(writer.buffers.create.indexes.size).be.eql(0);
    });
  });

  describe("sendWriteBuffer", () => {
    beforeEach(() => {
      writer.sdk.document.mCreate
        .onCall(0)
        .resolves("mCreate1")
        .onCall(1)
        .resolves("mCreate2");
    });

    it("should execute a mCreate action per collection and resolve with the result", async () => {
      const tbilisi = writer.buffers.create.add(
        "city",
        "tbilisi",
        { name: "Dana" },
        "dana",
      );
      writer.buffers.create.add(
        "city",
        "tbilisi",
        { name: "Aschen" },
        "aschen",
      );
      const colombo = writer.buffers.create.add(
        "city",
        "colombo",
        { name: "Ugo" },
        "ugo",
      );

      await writer.sendWriteBuffer("mCreate", writer.buffers.create);

      should(await tbilisi.promise.promise).be.eql("mCreate1");
      should(await colombo.promise.promise).be.eql("mCreate2");
      should(writer.sdk.document.mCreate)
        .be.calledWith("city", "tbilisi", [
          { _id: "dana", body: { name: "Dana" } },
          { _id: "aschen", body: { name: "Aschen" } },
        ])
        .be.calledWith("city", "colombo", [
          { _id: "ugo", body: { name: "Ugo" } },
        ]);
    });

    it("should resolve the promise with the error", async () => {
      writer.sdk.document.mCreate.rejects("error");
      const tbilisi = writer.buffers.create.add(
        "city",
        "tbilisi",
        { name: "Dana" },
        "dana",
      );

      await writer.sendWriteBuffer("mCreate", writer.buffers.create);

      should(tbilisi.promise.promise).be.rejectedWith("error");
    });
  });

  describe("sendGetBuffer", () => {
    beforeEach(() => {
      writer.sdk.document.mGet
        .onCall(0)
        .resolves("mGet1")
        .onCall(1)
        .resolves("mGet2");
    });

    it("should execute a mGet action per collection and resolve with the result", async () => {
      const tbilisi = writer.buffers.get.add(
        "city",
        "tbilisi",
        undefined,
        "dana",
      );
      writer.buffers.get.add("city", "tbilisi", undefined, "aschen");
      const colombo = writer.buffers.get.add(
        "city",
        "colombo",
        undefined,
        "ugo",
      );

      await writer.sendGetBuffer(writer.buffers.get);

      should(await tbilisi.promise.promise).be.eql("mGet1");
      should(await colombo.promise.promise).be.eql("mGet2");
      should(writer.sdk.document.mGet)
        .be.calledWith("city", "tbilisi", ["dana", "aschen"])
        .be.calledWith("city", "colombo", ["ugo"]);
    });

    it("should resolve the promise with the error", async () => {
      writer.sdk.document.mGet.rejects("error");
      const tbilisi = writer.buffers.get.add(
        "city",
        "tbilisi",
        undefined,
        "dana",
      );

      await writer.sendGetBuffer(writer.buffers.get);
      should(tbilisi.promise.promise).be.rejectedWith("error");
    });
  });

  describe("sendExistsBuffer", () => {
    let mGetResults1;
    let mGetResults2;

    beforeEach(() => {
      mGetResults1 = [{ _id: "dana" }, { _id: "aschen" }];
      mGetResults2 = [{ _id: "ugo" }];
      writer.sdk.document.mGet
        .onCall(0)
        .resolves({ successes: mGetResults1 })
        .onCall(1)
        .resolves({ successes: mGetResults2 });
    });

    it("should execute a mGet action per collection and resolve with the result", async () => {
      const tbilisi = writer.buffers.exists.add(
        "city",
        "tbilisi",
        undefined,
        "dana",
      );
      writer.buffers.exists.add("city", "tbilisi", undefined, "aschen");
      const colombo = writer.buffers.exists.add(
        "city",
        "colombo",
        undefined,
        "ugo",
      );

      await writer.sendExistsBuffer(writer.buffers.exists);

      should(await tbilisi.promise.promise).be.eql([true, true]);
      should(await colombo.promise.promise).be.eql([true]);
      should(writer.sdk.document.mGet)
        .be.calledWith("city", "tbilisi", ["dana", "aschen"])
        .be.calledWith("city", "colombo", ["ugo"]);
    });

    it("should only resolve existing documents", async () => {
      const tbilisi = writer.buffers.exists.add(
        "city",
        "tbilisi",
        undefined,
        "dana",
      );
      writer.buffers.exists.add("city", "tbilisi", undefined, "aschen");
      writer.sdk.document.mGet.onCall(0).resolves({
        successes: [{ _id: "dana" }],
        errors: [{ _id: "aschen" }],
      });

      await writer.sendExistsBuffer(writer.buffers.exists);

      should(await tbilisi.promise.promise).be.eql([true, false]);
    });

    it("should resolve the promise with the error", async () => {
      writer.sdk.document.mGet.rejects("error");
      const tbilisi = writer.buffers.exists.add(
        "city",
        "tbilisi",
        undefined,
        "dana",
      );

      await writer.sendExistsBuffer(writer.buffers.exists);
      should(tbilisi.promise.promise).be.rejectedWith("error");
    });
  });

  describe("sendDeleteBuffer", () => {
    beforeEach(() => {
      writer.sdk.document.mDelete
        .onCall(0)
        .resolves("mDelete1")
        .onCall(1)
        .resolves("mDelete2");
    });

    it("should execute a mGet action per collection and resolve with the result", async () => {
      const tbilisi = writer.buffers.delete.add(
        "city",
        "tbilisi",
        undefined,
        "dana",
      );
      writer.buffers.delete.add("city", "tbilisi", undefined, "aschen");
      const colombo = writer.buffers.delete.add(
        "city",
        "colombo",
        undefined,
        "ugo",
      );

      await writer.sendDeleteBuffer(writer.buffers.delete);

      should(await tbilisi.promise.promise).be.eql("mDelete1");
      should(await colombo.promise.promise).be.eql("mDelete2");
      should(writer.sdk.document.mDelete)
        .be.calledWith("city", "tbilisi", ["dana", "aschen"])
        .be.calledWith("city", "colombo", ["ugo"]);
    });

    it("should resolve the promise with the error", async () => {
      writer.sdk.document.mDelete.rejects("error");
      const tbilisi = writer.buffers.delete.add(
        "city",
        "tbilisi",
        undefined,
        "dana",
      );

      await writer.sendDeleteBuffer(writer.buffers.delete);
      should(tbilisi.promise.promise).be.rejectedWith("error");
    });
  });
});
