import React from 'react';
import ContentEditable from 'react-contenteditable';
import hljs from 'highlightjs';
import striptags from 'striptags';
import { map, range, unescape } from 'underscore';

const TAB_CHAR = " ";
const TAB_SIZE = 2;

export default class DocumentEditor extends React.Component {
  constructor(props) {
    super(props);

    this.handleInput = this.handleInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { document, setCaretPosition } = this.props;

    // if the document object is being updated in any way
    if (nextProps.document !== document && setCaretPosition) {
      // store the current cursor position, pre-update, so we can restore it after the update
      setCaretPosition(this.editor.htmlEl);
    }
  }

  componentDidUpdate() {
    const { caretPosition, restoreCaretPosition } = this.props;

    if (caretPosition) {
      restoreCaretPosition(this.editor.htmlEl, caretPosition);
    }
  }

  getCurrentLine() {
    const { caretPosition, document } = this.props;
    const lineBreaks = document.body.substr(0, caretPosition.start + 1).match(/\n/g);

    if (!lineBreaks) {
      return;
    }

    const lineNumber = lineBreaks.length - 1;

    return document.body.split(/\n/)[lineNumber < 0 ? 0 : lineNumber];
  }

  insertLineBreak() {
    // insert line break, maintaining current tab level
    let tabSize = 0;
    const currentLine = this.getCurrentLine();
    const indentMatch = currentLine.match(/^\s+/);

    if (indentMatch) {
      tabSize = indentMatch[0].length;
    }

    document.execCommand('insertText', false, `\n${TAB_CHAR.repeat(tabSize)}`);
  }

  handleInput(event) {
    const { target } = event;
    const { handleInput } = this.props;

    // turn any divs inserted by the browser into simple plain text linebreaks
    const value = target.value.
      replace(/<div>((.|\n)*)<\/div>/gi, "<br />$1").
      replace(/<br \/>/gi, "\n");

    // then pass this up the chain, stripping any remaining HTML
    handleInput(striptags(value));

    return true;
  }

  handleKeydown(event) {
    const { keyCode } = event;

    if (keyCode === 13) { // return
      this.insertLineBreak();
      event.preventDefault();
    }
  }

  renderLineNumbers(content) {
    const numberOfLines = content.split("\n").length;
    const lineNumbers = range(1, numberOfLines <= 1 ? 2 : numberOfLines);

    return map(lineNumbers, line => <span key={`line${line}`} className="line-number">{line}</span>);
  }

  render() {
    const { documentOptions, document } = this.props;
    let newContents;

    if (documentOptions.syntaxMode) {
      // highlight the code
      const highlightedContents = hljs.highlight(documentOptions.syntaxMode, document.body);

      // convert any html entities the above highlighter has added
      newContents = unescape(highlightedContents.value);
    } else {
      newContents = document.body;
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
