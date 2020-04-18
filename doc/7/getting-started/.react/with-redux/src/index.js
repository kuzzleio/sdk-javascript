/* snippet:start:1 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
/* snippet:end */

/* snippet:start:2 */
import * as serviceWorker from './serviceWorker';
import App from './App';
import storeApp from './state/reducers';
import sagas from './state/sagas';

import './index.css';
/* snippet:end */

/* snippet:start:3 */
const sagaMiddleware = createSagaMiddleware();
const store = createStore(storeApp, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(sagas);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
/* snippet:end */
