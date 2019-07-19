const
  sinon = require('sinon'),
  should = require('should');

describe('TestManager', () => {
  let
    TestManager,
    testManager;

  beforeEach(() => {
    TestManager = require('../lib/testManager.js');
  });

  describe('#constructor', () => {

    it('extract language and version from the basePath', () => {
      testManager = new TestManager('src/sdk-reference/js/5/');

      should(testManager.language).be.eql('js');
      should(testManager.version).be.eql('5');
    });

    it('throw an error if sdk-reference is not found in basePath', () => {
      should(() => {
        testManager = new TestManager('src/guide/1/essentials/');
      }).throw('Unable to find sdk-reference directory in basePath');
    });

    it('throw an error if language or version are not found in basePath', () => {
      should(() => {
        testManager = new TestManager('src/sdk-reference/');
      }).throw('Unable to find language in basePath');

      should(() => {
        testManager = new TestManager('src/sdk-reference/js');
      }).throw('Unable to find version in basePath');
    });

    it('throw an error if language is unsupported', () => {
      should(() => {
        testManager = new TestManager('src/sdk-reference/ruby/5');
      }).throw('Unknown language ruby. Supported languages: js, cpp, java, go, php, android');
    });
  });

});
