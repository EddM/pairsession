import React from 'react';

export default class Collaborator extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const activityClass = this.props.active ? 'active' : 'inactive';
    const selfClass = this.props.self ? 'self' : '';

    return (
      <li className={`collaborator ${activityClass} ${selfClass}`}>
        {this.props.name}
      </li>
    );
  }
}
