import React from 'react';
import ContentEditable from 'react-contenteditable';
import hljs from 'highlightjs';
import striptags from 'striptags';
import { map, range, unescape } from 'underscore';

const TAB_CHAR = " ";
const TAB_SIZE = 2;
const CARET_UPDATE_RATE = 200;

export default class DocumentEditor extends React.Component {
  constructor(props) {
    super(props);

    this.handleInput = this.handleInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.updateCaretPosition = this.updateCaretPosition.bind(this);

    // periodically update about this user's caret position
    setInterval(this.updateCaretPosition, CARET_UPDATE_RATE);
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

  updateCaretPosition() {
    this.props.setCaretPosition(this.editor.htmlEl);
  }

  getCurrentLine() {
    const { caretPosition, document } = this.props;
    const lineBreaks = document.body.substr(0, caretPosition.start + 1).match(/\n/g);

    if (!lineBreaks) {
      return '';
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

  renderCollaboratorPositions(content) {
    const { document, clientID } = this.props;

    if (!document.collaborators) {
      return content;
    }

    const collaborators = Object.values(document.collaborators).filter((collaborator) => {
      return collaborator.id !== clientID && collaborator.status === 'active';
    });

    collaborators.forEach((collaborator) => {
      let collaboratorPosition = [0, 0];

      if (collaborator.caret_position) {
        collaboratorPosition = collaborator.caret_position[0];
      }

      const head = content.slice(0, collaboratorPosition);
      const tail = content.slice(collaboratorPosition);

      content = `${head}<span class="caret" data-alias="${collaborator.alias}"></span>${tail}`
    })

    return content;
  }

  render() {
    const { documentOptions, document } = this.props;
    let newContents;

    const newContentsMarkedUp = this.renderCollaboratorPositions(document.body);

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
          <div className='document-editor-inner'>
            <ContentEditable
              tagName='code'
              className='document-editor-content'
              ref={editor => this.editor = editor}
              onChange={this.handleInput}
              onKeyDown={this.handleKeydown}
              html={newContents}
              spellCheck={false}
            />

            <div dangerouslySetInnerHTML={{ __html: newContentsMarkedUp }} className='editor-shadow' />
          </div>
        </pre>
      </div>
    );
  }
};
