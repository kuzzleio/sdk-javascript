var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = require('../stubs/kuzzle.stub'),
  KuzzleMemoryStorage = require('../../src/kuzzleMemoryStorage');

describe('KuzzleMemoryStorage methods', () => {
  var
    kuzzle = new Kuzzle('foo'),
    ms = new KuzzleMemoryStorage(kuzzle);

  describe('#regular case', () => {
    it('should parse the given arguments (no options)', () => {
      ms.append('foo', 'bar', (err, r) => {
        should(r.args).match({
          controller: 'ms',
          action: 'append'
        });
        should(r.query).match({
          _id: 'foo',
          body: { value: 'bar' }
        });
        should(r.cb).be.a.Function();
      });
    });

    it('should parse the given arguments (w options)', () => {
      ms.append('foo', 'bar', { queuable: true}, (err, r) => {
        should(r.args).match({
          controller: 'ms',
          action: 'append'
        });
        should(r.query).match({
          _id: 'foo',
          body: { value: 'bar' }
        });
        should(r.options).match({ queuable: true });
        should(r.cb).be.a.Function();
      });
    });

    it('should handle arguments with multiple cardinality', () => {
      ms.sinter('foo', (err, r) => {
        should(r.args).match({
          controller: 'ms',
          action: 'sinter'
        });
        should(r.query).match({
          _id: 'foo'
        });
        should.not.exist(r.query.body);
      });

      ms.sinter(['foo', 'bar'], (err, r) => {
        should(r.args).match({
          controller: 'ms',
          action: 'sinter'
        });
        should(r.query).match({
          body: {keys: ['foo', 'bar']}
        });
      });
    });

    it('should handle missing arguments', () => {
      ms.set((err, r) => {
        should()
      });
    });

  });

  describe('#functions with optional parameters', () => {
    it('should parse all given arguments', () => {
      ms.zadd('foo', {
        nx: true,
        xx: true,
        ch: true,
        incr: 2,
        score: 'score',
        member: 'member',
        members: [
          {score: 's1', member: 'm1'},
          {score: 's2', member: 'm2'}
        ]
      }, (err, r) => {
        should(r.args).match({
          controller: 'ms',
          action: 'zadd'
        });
        should(r.query).match({
          _id: 'foo',
          body: {
            nx: true,
            xx: true,
            ch: true,
            incr: 2,
            score: 'score',
            member: 'member',
            members: [
              {score: 's1', member: 'm1'},
              {score: 's2', member: 'm2'}
            ]
          }
        });
      });
    });

    it('blah', () => {
      var t = new kuzzle.ErrorCallback((err, r) => {
        console.log(err, r);
      });
      ms.get('foo', t);
    });

  });




});
