const Kuzzle = require('./src/Kuzzle');
const { Http, WebSocket } = require('./src/protocols');
const BaseController = require('./src/controllers/Base');
const KuzzleAbstractProtocol = require('./src/protocols/abstract/Base');
const KuzzleEventEmitter = require('./src/core/KuzzleEventEmitter');

const SearchResultBase = require('./src/core/searchResult/SearchResultBase');
const DocumentSearchResult = require('./src/core/searchResult/Document');
const ProfileSearchResult = require('./src/core/searchResult/Profile');
const RoleSearchResult = require('./src/core/searchResult/Role');
const SpecificationSearchResult = require('./src/core/searchResult/Specifications');
const UserSearchResult = require('./src/core/searchResult/User');

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
