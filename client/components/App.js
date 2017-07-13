import React from 'react';

import DocumentContainer from './containers/DocumentContainer.js';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <header className="site-header">
          <h1>PairSession</h1>
        </header>

        <DocumentContainer dispatch={this.props.dispatch} document={this.props.document} />
      </div>
    );
  }
}
