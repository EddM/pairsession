import React from 'react';
import ContentEditable from 'react-contenteditable';

import getCaretPosition from '../src/getCaretPosition.js';

export default class Document extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    // if the document object is being updated in any way
    if (nextProps.document !== this.props.document) {
      // store the current, pre-update, so we can restore it after the update
      const caretPosition = getCaretPosition(this.editor.htmlEl);
      this.setState({ caretPosition });
    }
  }

  componentDidUpdate() {
    const range = document.createRange();
    const sel = window.getSelection();
    const caretPosition = this.state.caretPosition;

    if (this.editor.htmlEl.childNodes[0]) {
      range.setStart(caretPosition[0], caretPosition[1]);
      range.collapse(true);
    }

    sel.removeAllRanges();
    sel.addRange(range);
  }

  componentDidMount() {
    this.editor.htmlEl.focus();
  }

  render() {
    return (
      <div className='document-editor-container'>
        <ContentEditable
          tagName='pre'
          className='document-editor'
          ref={editor => this.editor = editor}
          onChange={this.props.handleInput}
          html={this.props.document.contents}
          spellCheck={false}
        />
      </div>
    );
  }
};
