import React from 'react';
import { sortBy, map } from 'underscore';

import Collaborator from './Collaborator.js';

export default class CollaboratorList extends React.Component {
  constructor(props) {
    super(props);

    this.setAlias = this.setAlias.bind(this);
  }

  setAlias(newAlias) {
    this.props.cable.perform('update_collaborator', { client_id: this.props.clientID, alias: newAlias });
  }

  render() {
    let collaborators = sortBy(this.props.collaborators, (collaborator) => collaborator.status);

    collaborators = map(collaborators, (collaborator, index) => {
      const isSelf = collaborator.id === this.props.clientID;

      const component = <Collaborator
                          key={`collaborator${index}`}
                          name={collaborator.alias}
                          active={collaborator.status === 'active'}
                          self={isSelf}
                          setAlias={isSelf ? this.setAlias : undefined}
                        />;

      return component;
    });

    return (
      <div className='collaborator-list'>
        <h2>Collaborators</h2>

        <ul>
          {collaborators}
        </ul>
      </div>
    );
  }
}
