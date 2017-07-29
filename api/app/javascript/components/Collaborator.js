import React from 'react';

import AliasInput from './AliasInput.js';

export default class Collaborator extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editingAlias: false };

    this.handleClick = this.handleClick.bind(this);
    this.setAlias = this.setAlias.bind(this);
  }

  handleClick() {
    if (!this.props.self) {
      return;
    }

    this.setState({ editingAlias: true });
  }

  setAlias(newAlias) {
    this.setState({ editingAlias: false });
    this.props.setAlias(newAlias);
  }

  render() {
    const activityClass = this.props.active ? 'active' : 'inactive';
    const selfClass = this.props.self ? 'self' : '';
    let content = null;

    if (this.state.editingAlias) {
      content = <AliasInput setAlias={this.setAlias} cancel={() => this.setState({ editingAlias: false })} />;
    } else {
      content = this.props.name;
    }

    return (
      <li className={`collaborator ${activityClass} ${selfClass}`} onClick={this.handleClick}>
        {content}
      </li>
    );
  }
}
