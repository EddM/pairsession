import React from 'react';
import ContentEditable from 'react-contenteditable';
import hljs from 'highlightjs';
import striptags from 'striptags';
import { map, range, unescape } from 'underscore';

import { restoreSelection, saveSelection } from '../src/getCaretPosition.js';

export default class DocumentEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = { content: props.document.body };
    this.handleInput = this.handleInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // if the document object is being updated in any way
    if (nextProps.document !== this.props.document) {
      // store the current cursor position, pre-update, so we can restore it after the update
      const caretPosition = saveSelection(this.editor.htmlEl);
      this.setState({ caretPosition });
    }
  }

  componentDidUpdate() {
    if (this.state.caretPosition) {
      restoreSelection(this.editor.htmlEl, this.state.caretPosition);
    }
  }

  handleInput(event) {
    // turn any divs inserted by the browser into simple plain text linebreaks
    const value = event.target.value.
      replace(/<div>((.|\n)*)<\/div>/gi, "<br />$1").
      replace(/<br \/>/gi, "\n");

    // then pass this up the chain, stripping any remaining HTML
    this.props.handleInput(striptags(value));

    return true;
  }

  handleKeydown(event) {
    // if (event.keyCode === 13) {
    //   // handle current tab level
    //   document.execCommand('insertText', false, '\n')
    //   document.execCommand('insertText', false, '  ')
    //   event.preventDefault();
    // }
  }

  renderLineNumbers(content) {
    const numberOfLines = content.split("\n").length;
    const lineNumbers = range(1, numberOfLines <= 1 ? 2 : numberOfLines);

    return map(lineNumbers, (line) => <span key={`line${line}`} className="line-number">{line}</span>);
  }

  render() {
    let newContents;

    if (this.props.documentOptions.syntaxMode) {
      // highlight the code
      const highlightedContents = hljs.highlight(
        this.props.documentOptions.syntaxMode,
        this.props.document.body
      );

      // convert any html entities the above highlighter has added
      newContents = unescape(highlightedContents.value);
    } else {
      newContents = this.props.document.body;
    }

    return (
      <div className='document-editor-container'>
        <div className='line-numbers'>
          {this.renderLineNumbers(newContents)}
        </div>

        <pre className='document-editor'>
          <ContentEditable
            tagName='code'
            className='document-editor-content'
            ref={editor => this.editor = editor}
            onChange={this.handleInput}
            onKeyDown={this.handleKeydown}
            html={newContents}
            spellCheck={false}
          />
        </pre>
      </div>
    );
  }
};
