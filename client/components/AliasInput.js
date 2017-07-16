import React from 'react';

export default class AliasInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleClick(event) {
    event.stopPropagation();
    this.props.setAlias(this.input.value);
  }

  handleKeyDown(event) {
    if (event.keyCode === 13) { // return
      this.props.setAlias(this.input.value);
    }
  }

  render() {
    return (
      <div className="alias-input">
        <input
          ref={(input) => this.input = input}
          type="text"
          autoFocus={true}
          placeholder='Enter an alias'
          onKeyDown={this.handleKeyDown}
        />

        <button onClick={this.handleClick}>Set Alias</button>
      </div>
    );
  }
}
