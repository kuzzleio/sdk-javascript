const
  ProfileSearchResult = require('../../../src/controllers/searchResult/profile'),
  Profile = require('../../../src/controllers/security/profile'),
  sinon = require('sinon'),
  should = require('should');

describe('ProfileSearchResult', () => {
  const options = {opt: 'in'};

  let
    kuzzle,
    request,
    response,
    searchResult;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };

    request = {
      body: {foo: 'bar'},
      controller: 'security',
      action: 'searchProfiles',
    };
  });

  describe('constructor', () => {
    it('should create a ProfileSearchResult instance with good properties', () => {
      response = {
        hits: [
          {_id: 'profile1', _version: 1, _source: {policies: ['foo', 'bar']}},
          {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz']}}
        ],
        total: 3
      };

      searchResult = new ProfileSearchResult(kuzzle, request, options, response);

      should(searchResult.kuzzle).be.equal(kuzzle);
      should(searchResult.request).be.equal(request);
      should(searchResult.options).be.equal(options);
      should(searchResult.response).be.equal(response);

      should(searchResult.fetched).be.equal(2);
      should(searchResult.total).be.equal(3);

      should(searchResult.controller).be.equal('security');
      should(searchResult.searchAction).be.equal('searchProfiles');
      should(searchResult.scrollAction).be.equal('scrollProfiles');

      should(searchResult.hits).be.an.Array();
      should(searchResult.hits.length).be.equal(2);

      should(searchResult.hits[0]).be.an.instanceOf(Profile);
      should(searchResult.hits[0]._id).be.eql('profile1');
      should(searchResult.hits[0].policies).be.eql(['foo', 'bar']);

      should(searchResult.hits[1]).be.an.instanceOf(Profile);
      should(searchResult.hits[1]._id).be.eql('profile2');
      should(searchResult.hits[1].policies).be.eql(['foo', 'baz']);
    });
  });

  describe('next', () => {
    it('should resolve null without calling kuzzle query if all results are already fetched', () => {
      response = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'profile1', _version: 1, _source: {policies: ['foo', 'bar']}},
          {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz']}}
        ],
        total: 2
      };

      searchResult = new ProfileSearchResult(kuzzle, request, options, response);

      return searchResult.next()
        .then(result => {
          should(kuzzle.query).not.be.called();
          should(result).be.Null();
        });

    });

    it('should throw an error if neither scroll, nor size/sort, nor size/from parameters are set', () => {
      response = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'profile1', _version: 1, _source: {policies: ['foo', 'bar']}},
          {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz']}}
        ],
        total: 30
      };

      searchResult = new ProfileSearchResult(kuzzle, request, options, response);

      should(function () {
        searchResult.next();
      }).throw('Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params');
    });

    describe('#with scroll option', () => {
      const nextResponse = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'profile3', _version: 1, _source: {policies: ['baz']}},
          {_id: 'profile4', _version: 3, _source: {policies: ['foo', 'bar', 'baz']}}
        ],
        total: 30
      };

      beforeEach(() => {
        request.scroll = '1m';

        response = {
          scrollId: 'scroll-id',
          hits: [
            {_id: 'profile1', _version: 1, _source: {policies: ['foo', 'bar']}},
            {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz']}}
          ],
          total: 30
        };
        searchResult = new ProfileSearchResult(kuzzle, request, options, response);

        kuzzle.query.resolves(nextResponse);
      });

      it('should call security/scrollProfiles action with scrollId parameter and resolve the current object', () => {
        return searchResult.next()
          .then(res => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                body: {foo: 'bar'},
                controller: 'security',
                action: 'scrollProfiles',
                scroll: '1m',
                scrollId: 'scroll-id'
              }, options);
            should(res).be.equal(searchResult);
          });
      });

      it('should set the response and increment the "fetched" property', () => {
        should(searchResult.fetched).be.equal(2);
        should(searchResult.response).be.equal(response);
        return searchResult.next()
          .then(() => {
            should(searchResult.fetched).be.equal(4);
            should(searchResult.response).be.equal(nextResponse);

            should(searchResult.hits).be.an.Array();
            should(searchResult.hits.length).be.equal(2);

            should(searchResult.hits[0]).be.an.instanceOf(Profile);
            should(searchResult.hits[0]._id).be.eql('profile3');
            should(searchResult.hits[0].policies).be.eql(['baz']);

            should(searchResult.hits[1]).be.an.instanceOf(Profile);
            should(searchResult.hits[1]._id).be.eql('profile4');
            should(searchResult.hits[1].policies).be.eql(['foo', 'bar', 'baz']);
          });
      });
    });

    describe('#with size and sort option', () => {
      const nextResponse = {
        hits: [
          {_id: 'profile3', _version: 1, _source: {policies: ['baz']}},
          {_id: 'profile4', _version: 3, _source: {policies: ['foo', 'bar', 'baz']}}
        ],
        total: 30
      };

      beforeEach(() => {
        request.size = 2;
        request.sort = ['foo', {bar: 'asc'}];

        response = {
          hits: [
            {_id: 'profile1', _version: 1, _source: {policies: ['foo', 'bar'], foo: 'bar', bar: 1234}},
            {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz'], foo: 'baz', bar: 3456}}
          ],
          total: 30
        };
        searchResult = new ProfileSearchResult(kuzzle, request, options, response);

        kuzzle.query.resolves(nextResponse);
      });

      it('should call security/searchProfiles action with search_after parameter and resolve the current object', () => {
        return searchResult.next()
          .then(res => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                body: {foo: 'bar'},
                controller: 'security',
                action: 'searchProfiles',
                size: 2,
                sort: ['foo', {bar: 'asc'}],
                search_after: ['baz', 3456]
              }, options);
            should(res).be.equal(searchResult);
          });
      });

      it('should set the response and increment the "fetched" property', () => {
        should(searchResult.fetched).be.equal(2);
        should(searchResult.response).be.equal(response);
        return searchResult.next()
          .then(() => {
            should(searchResult.fetched).be.equal(4);
            should(searchResult.response).be.equal(nextResponse);

            should(searchResult.hits).be.an.Array();
            should(searchResult.hits.length).be.equal(2);

            should(searchResult.hits[0]).be.an.instanceOf(Profile);
            should(searchResult.hits[0]._id).be.eql('profile3');
            should(searchResult.hits[0].policies).be.eql(['baz']);

            should(searchResult.hits[1]).be.an.instanceOf(Profile);
            should(searchResult.hits[1]._id).be.eql('profile4');
            should(searchResult.hits[1].policies).be.eql(['foo', 'bar', 'baz']);
          });
      });
    });

    describe('#with from and size option', () => {
      const nextResponse = {
        hits: [
          {_id: 'profile3', _version: 1, _source: {policies: ['baz']}},
          {_id: 'profile4', _version: 3, _source: {policies: ['foo', 'bar', 'baz']}}
        ],
        total: 30
      };

      beforeEach(() => {
        request.size = 2;
        request.from = 2;

        response = {
          hits: [
            {_id: 'profile1', _version: 1, _source: {policies: ['foo', 'bar']}},
            {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz']}}
          ],
          total: 30
        };
        searchResult = new ProfileSearchResult(kuzzle, request, options, response);

        kuzzle.query.resolves(nextResponse);
      });

      it('should resolve null without calling kuzzle query if from parameter is greater than the search count', () => {
        request.from = 30;

        return searchResult.next()
          .then(result => {
            should(kuzzle.query).not.be.called();
            should(result).be.Null();
          });

      });


      it('should call security/searchProfiles action with from/size parameters and resolve the current object', () => {
        return searchResult.next()
          .then(res => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                body: {foo: 'bar'},
                controller: 'security',
                action: 'searchProfiles',
                size: 2,
                from: 2
              }, options);
            should(res).be.equal(searchResult);
          });
      });

      it('should set the response and increment the "fetched" property', () => {
        should(searchResult.fetched).be.equal(2);
        should(searchResult.response).be.equal(response);
        return searchResult.next()
          .then(() => {
            should(searchResult.fetched).be.equal(4);
            should(searchResult.response).be.equal(nextResponse);

            should(searchResult.hits).be.an.Array();
            should(searchResult.hits.length).be.equal(2);

            should(searchResult.hits[0]).be.an.instanceOf(Profile);
            should(searchResult.hits[0]._id).be.eql('profile3');
            should(searchResult.hits[0].policies).be.eql(['baz']);

            should(searchResult.hits[1]).be.an.instanceOf(Profile);
            should(searchResult.hits[1]._id).be.eql('profile4');
            should(searchResult.hits[1].policies).be.eql(['foo', 'bar', 'baz']);
          });
      });
    });
  });
});
