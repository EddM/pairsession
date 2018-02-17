import React from 'react';

export default class DocumentOptions extends React.Component {
  constructor(props) {
    super(props);

    this.handleSyntaxModeChange = this.handleSyntaxModeChange.bind(this);
  }

  handleSyntaxModeChange(event) {
    this.props.syntaxModeChanged(event.target.value);
  }

  renderOption(label, value) {
    const { syntaxMode } = this.props;
    let optionValue = value;

    if (optionValue === null) {
      optionValue = '';
    }

    return <option value={optionValue} selected={value == syntaxMode}>{label}</option>
  }

  render() {
    return (
      <div className='document-options'>
        <h2>Options</h2>

        <select onChange={this.handleSyntaxModeChange}>
          {this.renderOption(null, 'Plain Text')}
          {this.renderOption('Ruby', 'ruby')}
          {this.renderOption('PHP', 'php')}
          {this.renderOption('JavaScript', 'javascript')}
          {this.renderOption('HTML', 'html')}
          {this.renderOption('SQL', 'sql')}
        </select>
      </div>
    );
  }
}
