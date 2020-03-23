const Kuzzle = require('./src/Kuzzle');
const { Http, WebSocket } = require('./src/protocols');
const BaseController = require('./src/controllers/base');
const KuzzleAbstractProtocol = require('./src/protocols/abstract/common');
const KuzzleEventEmitter = require('./src/core/KuzzleEventEmitter');
const {
  SearchResultBase,
  DocumentSearchResult,
  ProfileSearchResult,
  RoleSearchResult,
  SpecificationSearchResult,
  UserSearchResult
} = require('./src/controllers/searchResult');

if (typeof window !== 'undefined' && typeof BUILT === 'undefined') {
  throw new Error('It looks like you are using the Nodejs version of Kuzzle SDK ' +
               'in a browser. ' +
               'It is strongly recommended to use the browser-specific build instead. ' +
               'Learn more at https://github.com/kuzzleio/sdk-javascript/tree/master#browser');
}

module.exports = {
  Kuzzle,
  Http,
  WebSocket,
  BaseController,
  KuzzleAbstractProtocol,
  KuzzleEventEmitter,
  SearchResultBase,
  DocumentSearchResult,
  ProfileSearchResult,
  RoleSearchResult,
  SpecificationSearchResult,
  UserSearchResult
};
