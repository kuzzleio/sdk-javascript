// defined by webpack plugin
declare var BUILT: any;

if (typeof window !== 'undefined' && typeof BUILT === 'undefined') {
  throw new Error('It looks like you are using the Nodejs version of Kuzzle SDK ' +
               'in a browser. ' +
               'It is strongly recommended to use the browser-specific build instead. ' +
               'Learn more at https://github.com/kuzzleio/sdk-javascript/tree/master#browser');
}

import { Kuzzle } from './src/Kuzzle';
import { Http, WebSocket } from './src/protocols';
import { BaseController } from './src/controllers/Base';
import { KuzzleAbstractProtocol } from './src/protocols/abstract/Base';
import { KuzzleEventEmitter } from './src/core/KuzzleEventEmitter';

import { SearchResultBase } from './src/core/searchResult/SearchResultBase';
import { DocumentSearchResult } from './src/core/searchResult/Document';
import { ProfileSearchResult } from './src/core/searchResult/Profile';
import { RoleSearchResult } from './src/core/searchResult/Role';
import { SpecificationsSearchResult } from './src/core/searchResult/Specifications';
import { UserSearchResult } from './src/core/searchResult/User';

const exported = {
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
  SpecificationsSearchResult,
  UserSearchResult
}

export default exported;

module.exports = exported;
