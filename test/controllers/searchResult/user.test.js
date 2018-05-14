const
  UserSearchResult = require('../../../src/controllers/searchResult/user'),
  User = require('../../../src/controllers/security/user'),
  sinon = require('sinon'),
  should = require('should');

describe('UserSearchResult', () => {
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
      action: 'searchUsers',
    };
  });

  describe('constructor', () => {
    it('should create a UserSearchResult instance with good properties', () => {
      response = {
        hits: [
          {_id: 'uid1', _version: 1, _source: {profileIds: ['profile1'], name: 'John Doe'}},
          {_id: 'uid2', _version: 3, _source: {profileIds: ['admin'], name: 'Jane Doe'}}
        ],
        total: 3
      };

      searchResult = new UserSearchResult(kuzzle, request, options, response);

      should(searchResult.kuzzle).be.equal(kuzzle);
      should(searchResult.request).be.equal(request);
      should(searchResult.options).be.equal(options);
      should(searchResult.response).be.equal(response);

      should(searchResult.fetched).be.equal(2);
      should(searchResult.total).be.equal(3);

      should(searchResult.controller).be.equal('security');
      should(searchResult.searchAction).be.equal('searchUsers');
      should(searchResult.scrollAction).be.equal('scrollUsers');

      should(searchResult.hits).be.an.Array();
      should(searchResult.hits.length).be.equal(2);

      should(searchResult.hits[0]).be.an.instanceOf(User);
      should(searchResult.hits[0]._id).be.eql('uid1');
      should(searchResult.hits[0].content).be.eql({name: 'John Doe', profileIds: ['profile1']});
      should(searchResult.hits[0].profileIds).be.eql(['profile1']);

      should(searchResult.hits[1]).be.an.instanceOf(User);
      should(searchResult.hits[1]._id).be.eql('uid2');
      should(searchResult.hits[1].content).be.eql({name: 'Jane Doe', profileIds: ['admin']});
      should(searchResult.hits[1].profileIds).be.eql(['admin']);
    });
  });

  describe('next', () => {
    it('should resolve null without calling kuzzle query if all results are already fetched', () => {
      response = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'uid1', _version: 1, _source: {profileIds: ['profile1'], name: 'John Doe'}},
          {_id: 'uid2', _version: 3, _source: {profileIds: ['admin'], name: 'Jane Doe'}}
        ],
        total: 2
      };

      searchResult = new UserSearchResult(kuzzle, request, options, response);

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
          {_id: 'uid1', _version: 1, _source: {profileIds: ['profile1'], name: 'John Doe'}},
          {_id: 'uid2', _version: 3, _source: {profileIds: ['admin'], name: 'Jane Doe'}}
        ],
        total: 30
      };

      searchResult = new UserSearchResult(kuzzle, request, options, response);

      should(function () {
        searchResult.next();
      }).throw('Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params');
    });

    describe('#with scroll option', () => {
      const nextResponse = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'uid3', _version: 2, _source: {profileIds: ['profile1', 'admin'], name: 'Sarah Connor'}},
          {_id: 'uid4', _version: 12, _source: {profileIds: ['profile2', 'guest'], name: 'Obiwan Kenobi'}}
        ],
        total: 30
      };

      beforeEach(() => {
        request.scroll = '1m';

        response = {
          scrollId: 'scroll-id',
          hits: [
            {_id: 'uid1', _version: 1, _source: {profileIds: ['profile1'], name: 'John Doe'}},
            {_id: 'uid2', _version: 3, _source: {profileIds: ['admin'], name: 'Jane Doe'}}
          ],
          total: 30
        };
        searchResult = new UserSearchResult(kuzzle, request, options, response);

        kuzzle.query.resolves(nextResponse);
      });

      it('should call security/scrollUsers action with scrollId parameter and resolve the current object', () => {
        return searchResult.next()
          .then(res => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                body: {foo: 'bar'},
                controller: 'security',
                action: 'scrollUsers',
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

            should(searchResult.hits[0]).be.an.instanceOf(User);
            should(searchResult.hits[0]._id).be.eql('uid3');
            should(searchResult.hits[0].content).be.eql({name: 'Sarah Connor', profileIds: ['profile1', 'admin']});
            should(searchResult.hits[0].profileIds).be.eql(['profile1', 'admin']);

            should(searchResult.hits[1]).be.an.instanceOf(User);
            should(searchResult.hits[1]._id).be.eql('uid4');
            should(searchResult.hits[1].content).be.eql({name: 'Obiwan Kenobi', profileIds: ['profile2', 'guest']});
            should(searchResult.hits[1].profileIds).be.eql(['profile2', 'guest']);
          });
      });
    });

    describe('#with size and sort option', () => {
      const nextResponse = {
        hits: [
          {_id: 'uid3', _version: 2, _source: {profileIds: ['profile1', 'admin'], name: 'Sarah Connor', bar: 5678}},
          {_id: 'uid4', _version: 12, _source: {profileIds: ['profile2', 'guest'], name: 'Obiwan Kenobi', bar: 6789}}
        ],
        total: 30
      };

      beforeEach(() => {
        request.size = 2;
        request.sort = ['name', {bar: 'asc'}];

        response = {
          hits: [
            {_id: 'uid1', _version: 1, _source: {profileIds: ['profile1'], name: 'John Doe', bar: 1234}},
            {_id: 'uid2', _version: 3, _source: {profileIds: ['admin'], name: 'Jane Doe', bar: 3456}}
          ],
          total: 30
        };
        searchResult = new UserSearchResult(kuzzle, request, options, response);

        kuzzle.query.resolves(nextResponse);
      });

      it('should call security/searchUsers action with search_after parameter and resolve the current object', () => {
        return searchResult.next()
          .then(res => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                body: {foo: 'bar'},
                controller: 'security',
                action: 'searchUsers',
                size: 2,
                sort: ['name', {bar: 'asc'}],
                search_after: ['Jane Doe', 3456]
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

            should(searchResult.hits[0]).be.an.instanceOf(User);
            should(searchResult.hits[0]._id).be.eql('uid3');
            should(searchResult.hits[0].content).be.eql({name: 'Sarah Connor', profileIds: ['profile1', 'admin'], bar: 5678});
            should(searchResult.hits[0].profileIds).be.eql(['profile1', 'admin']);

            should(searchResult.hits[1]).be.an.instanceOf(User);
            should(searchResult.hits[1]._id).be.eql('uid4');
            should(searchResult.hits[1].content).be.eql({name: 'Obiwan Kenobi', profileIds: ['profile2', 'guest'], bar: 6789});
            should(searchResult.hits[1].profileIds).be.eql(['profile2', 'guest']);
          });
      });
    });

    describe('#with from and size option', () => {
      const nextResponse = {
        hits: [
          {_id: 'uid3', _version: 2, _source: {profileIds: ['profile1', 'admin'], name: 'Sarah Connor'}},
          {_id: 'uid4', _version: 12, _source: {profileIds: ['profile2', 'guest'], name: 'Obiwan Kenobi'}}
        ],
        total: 30
      };

      beforeEach(() => {
        request.size = 2;
        request.from = 2;

        response = {
          hits: [
            {_id: 'uid1', _version: 1, _source: {profileIds: ['profile1'], name: 'John Doe'}},
            {_id: 'uid2', _version: 3, _source: {profileIds: ['admin'], name: 'Jane Doe'}}
          ],
          total: 30
        };
        searchResult = new UserSearchResult(kuzzle, request, options, response);

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


      it('should call security/searchUsers action with from/size parameters and resolve the current object', () => {
        return searchResult.next()
          .then(res => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                body: {foo: 'bar'},
                controller: 'security',
                action: 'searchUsers',
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

            should(searchResult.hits[0]).be.an.instanceOf(User);
            should(searchResult.hits[0]._id).be.eql('uid3');
            should(searchResult.hits[0].content).be.eql({name: 'Sarah Connor', profileIds: ['profile1', 'admin']});
            should(searchResult.hits[0].profileIds).be.eql(['profile1', 'admin']);

            should(searchResult.hits[1]).be.an.instanceOf(User);
            should(searchResult.hits[1]._id).be.eql('uid4');
            should(searchResult.hits[1].content).be.eql({name: 'Obiwan Kenobi', profileIds: ['profile2', 'guest']});
            should(searchResult.hits[1].profileIds).be.eql(['profile2', 'guest']);
          });
      });
    });
  });
});
