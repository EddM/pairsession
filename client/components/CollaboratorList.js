import React from 'react';
import { sortBy, map } from 'underscore';

import Collaborator from './Collaborator.js';

export default class CollaboratorList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let collaborators = sortBy(this.props.collaborators, (collaborator) => {
      return collaborator.status;
    });

    collaborators = map(collaborators, (collaborator, index) => {
      const component = <Collaborator
                          key={`collaborator${index}`}
                          name={collaborator.alias}
                          active={collaborator.status === 'active'}
                          self={collaborator.id === this.props.clientID}
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
