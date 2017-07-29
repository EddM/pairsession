import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux';

import reducers from '../reducers';
import AppContainer from '../components/containers/AppContainer.js';

const rootElement = document.getElementById('root');
const initialDocument = JSON.parse(rootElement.dataset["props"]).document;

let store = createStore(
  reducers,
  { document: initialDocument },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <Provider store={store}>
    <AppContainer document={initialDocument} />
  </Provider>,
  rootElement
);
