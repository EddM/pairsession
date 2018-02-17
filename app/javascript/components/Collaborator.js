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
    const { active, self, name } = this.props;
    const { editingAlias } = this.state;
    const activityClass = active ? 'active' : 'inactive';
    const selfClass = self ? 'self' : '';

    return (
      <li className={`collaborator ${activityClass} ${selfClass}`} onClick={this.handleClick}>
        {editingAlias
          ? <AliasInput setAlias={this.setAlias} cancel={() => this.setState({ editingAlias: false })} />
          : name}
      </li>
    );
  }
}
