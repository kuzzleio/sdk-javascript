// defined by webpack plugin
declare var BUILT: any;

if (typeof window !== 'undefined' && typeof BUILT === 'undefined') {
  throw new Error('It looks like you are using the Nodejs version of Kuzzle SDK ' +
               'in a browser. ' +
               'It is strongly recommended to use the browser-specific build instead. ' +
               'Learn more at https://github.com/kuzzleio/sdk-javascript/tree/master#browser');
}

export * from './src/Kuzzle';
export * from './src/protocols';
export * from './src/protocols/abstract/Base';
export * from './src/core/KuzzleEventEmitter';

export * from './src/core/searchResult/SearchResultBase';
export * from './src/core/searchResult/Document';
export * from './src/core/searchResult/Profile';
export * from './src/core/searchResult/Role';
export * from './src/core/searchResult/Specifications';
export * from './src/core/searchResult/User';

export * from './src/utils/interfaces';

export * from './src/controllers/Auth';
export * from './src/controllers/Base';
export * from './src/controllers/Collection';
export * from './src/controllers/Document';
export * from './src/controllers/Index';
export * from './src/controllers/Realtime';
