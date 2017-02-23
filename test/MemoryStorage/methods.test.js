var
  should = require('should'),
  Kuzzle = require('../stubs/kuzzle.stub'),
  MemoryStorage = require('../../src/MemoryStorage');

describe('MemoryStorage methods', function () {
  var
    kuzzle = new Kuzzle('foo'),
    ms = new MemoryStorage(kuzzle);

  describe('#regular case', function () {
    it('should parse the given arguments (no options)', function () {
      ms.append('foo', 'bar', function (err, r) {
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

    it('should parse the given arguments (w options)', function () {
      ms.append('foo', 'bar', { queuable: true}, function (err, r) {
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

    it('should handle arguments with multiple cardinality', function () {
      ms.sinter('foo', function (err, r) {
        should(r.args).match({
          controller: 'ms',
          action: 'sinter'
        });
        should(r.query).match({
          _id: 'foo'
        });
        should.not.exist(r.query.body);
      });

      ms.sinter(['foo', 'bar'], function (err, r) {
        should(r.args).match({
          controller: 'ms',
          action: 'sinter'
        });
        should(r.query).match({
          body: {keys: ['foo', 'bar']}
        });
      });
    });
  });

  describe('#functions with optional parameters', function () {
    it('should parse all given arguments', function () {
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
      }, function (err, r) {
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
  });
});
