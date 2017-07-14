import React from 'react';

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header className="site-header">
        <h1>PairSession</h1>
        {this.props.children}
      </header>
    );
  }
}
