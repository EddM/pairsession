import React from 'react';

export default class DocumentOptions extends React.Component {
  constructor(props) {
    super(props);

    this.handleSyntaxModeChange = this.handleSyntaxModeChange.bind(this);
  }

  handleSyntaxModeChange(event) {
    this.props.syntaxModeChanged(event.target.value);
  }

  render() {
    return (
      <div className='document-options'>
        <h2>Options</h2>

        <select onChange={this.handleSyntaxModeChange}>
          <option value=''>Plain Text</option>
          <option value='ruby'>Ruby</option>
          <option value='php'>PHP</option>
          <option value='javascript'>JavaScript</option>
          <option value='html'>HTML</option>
          <option value='sql'>SQL</option>
        </select>
      </div>
    );
  }
}
