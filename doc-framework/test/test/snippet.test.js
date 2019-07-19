const
  mockrequire = require('mock-require'),
  sinon = require('sinon'),
  should = require('should'),
  TestResult = require('../lib/helpers/testResult');

describe('Snippet', () => {
  let
    Snippet,
    snippet,
    testFile,
    readYamlStub,
    fsStub,
    snippetContent,
    language,
    templateContent,
    testDefinition;

  beforeEach(() => {
    Snippet = require('../lib/snippet');

    testDefinition = {
      name: 'create',
      description: 'create something',
      hooks: {
        before: 'curl localhost:7512/before',
        after: 'curl localhost:7512/after'
      },
      template: 'default',
      expect: 'create success'
    };

    snippetContent = 'const toto = 42;';

    templateContent =
      `
      The template is here
      [snippet-code]
      end.
      `;

    readYamlStub = {
      sync: sinon.stub()
    };

    fsStub = {
      readFileSync: sinon.stub(),
      existsSync: sinon.stub(),
      writeFileSync: sinon.stub()
    };

    mockrequire('read-yaml', readYamlStub);
    mockrequire('fs', fsStub);

    Snippet = mockrequire.reRequire('../lib/snippet');

    readYamlStub.sync.returns(testDefinition);

    fsStub.readFileSync.onCall(0).returns(snippetContent);
    fsStub.readFileSync.onCall(1).returns(templateContent);
    fsStub.existsSync.returns(true);

    testFile = 'sdk-reference/js/6.x/index/create/snippet/create.test.yml';
    language = 'js';
  });

  afterEach(() => {
    mockrequire.stopAll();
  });

  describe('#build', () => {
    it('initialize snippet attributes', () => {
      snippet = new Snippet(testFile, language);

      snippet.build();

      should(snippet.snippetFile).endWith('create.js');
      should(snippet.templateFile).endWith('default.tpl.js');
      should(snippet.snippetContent).be.eql(snippetContent);
      should(snippet.name).be.eql(testDefinition.name);
      should(snippet.description).be.eql(testDefinition.description);
    });

    it('throw an error if test definition is empty', () => {
      readYamlStub.sync.returns('');
      snippet = new Snippet(testFile, language);

      should(() => {
        snippet.build();
      }).throw(TestResult);
    });

    it('throw an error if templateFile does not exists', () => {
      fsStub.existsSync.returns('');
      snippet = new Snippet(testFile, language);

      should(() => {
        snippet.build();
      }).throw(TestResult);
    });

    it('throw an error if snippetFile does not exists', () => {
      fsStub.existsSync.returns('');
      snippet = new Snippet(testFile, language);

      should(() => {
        snippet.build();
      }).throw(TestResult);
    });
  });

  describe('#render', () => {
    it('should render the snippet inside the template', () => {
      snippet = new Snippet(testFile, language).build();
      const renderedSnippet =
      `
      The template is here
      const toto = 42;
      end.
      `;

      snippet.render();

      should(fsStub.writeFileSync.getCall(0).args[1]).be.eql(renderedSnippet);
    });

    it('should replace the generic class name with a java snippet', () => {
      templateContent =
        `
        class CodeExampleGenericClass {
          [snippet-code]
        }
      `;
      fsStub.readFileSync.onCall(1).returns(templateContent);
      language = 'java';

      snippet = new Snippet(testFile, language).build();
      const renderedSnippet =
      `
        class create {
          const toto = 42;
        }
      `;

      snippet.render();

      should(fsStub.writeFileSync.getCall(0).args[1]).be.eql(renderedSnippet);
    });

    it('throw an error if template content does not include the snippet tag', () => {
      fsStub.readFileSync.onCall(1).returns('I am a template');
      snippet = new Snippet(testFile, language).build();

      should(() => {
        snippet.render();
      }).throw(TestResult);
    });

    it('throw an error if the rendered snippet file is not created', () => {
      fsStub.existsSync.onCall(2).returns(false);
      snippet = new Snippet(testFile, language).build();

      should(() => {
        snippet.render();
      }).throw(TestResult);
    });

  });

});
