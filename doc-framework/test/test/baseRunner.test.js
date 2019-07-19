const
  mockrequire = require('mock-require'),
  sinon = require('sinon'),
  should = require('should'),
  TestResult = require('../lib/helpers/testResult');

describe('BaseRunner', () => {
  let
    BaseRunner,
    runner,
    snippetMock;

  beforeEach(() => {
    BaseRunner = require('../lib/runners/baseRunner');

    snippetMock = {
      render: sinon.spy(),
      clean: sinon.spy(),
      saveRendered: sinon.spy(),
      hooks: {},
      snippetFile: ''
    };

    runner = new BaseRunner();
  });

  afterEach(() => {
    mockrequire.stopAll();
  });

  describe('#run', () => {
    it('execute each step to test and lint a snippet', async () => {
      runner.lint = sinon.spy();
      runner.runSnippet = sinon.spy();

      await runner.run(snippetMock);

      should(snippetMock.render).be.calledOnce();
      should(runner.lint.calledAfter(snippetMock.render)).be.eql(true);
      should(runner.runSnippet.calledAfter(runner.lint)).be.eql(true);
      should(snippetMock.clean.calledAfter(runner.runSnippet)).be.eql(true);
    });
  });

  it('should save rendered snippet and throw exception on error', async () => {
    runner.lint = sinon.spy();
    runner.runSnippet = sinon.stub().throws(new Error('runSnippet error'));

    try {
      await runner.run(snippetMock);
    } catch (e) {
      should(e).be.instanceOf(Error);
      should(snippetMock.saveRendered).be.calledOnce();
    }
  });
});
