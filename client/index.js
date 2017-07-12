import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';

import ActionCable from 'actioncable';

const cable = ActionCable.createConsumer('wss://localhost:3000/cable')

cable.subscriptions.create({
  channel: 'DocumentChannel',
  name: 'foo'
});

ReactDOM.render(<App />, document.getElementById('root'));
