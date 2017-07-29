import React from 'react';
import Cookies from 'js-cookie';
import uuidv4 from 'uuid/v4';

import DocumentContainer from './containers/DocumentContainer.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    if (!Cookies.get('client_id')) {
      Cookies.set('client_id', uuidv4());
    }
  }

  render() {
    const { dispatch, document, clientID } = this.props;

    return (
      <div>
        <DocumentContainer dispatch={dispatch} document={document} clientID={clientID} />
      </div>
    );
  }
}
