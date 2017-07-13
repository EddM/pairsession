import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux';
import ActionCable from 'actioncable';

import reducers from './reducers';
import AppContainer from './components/containers/AppContainer.js';

const cable = ActionCable.createConsumer('ws://localhost:3000/cable')

cable.subscriptions.create({
  channel: 'DocumentChannel',
  name: 'foo'
});

let store = createStore(reducers);

ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
);
