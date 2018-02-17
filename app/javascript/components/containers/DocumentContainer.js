import React from 'react';
import ot from 'ot';

import DocumentCable from '../../src/DocumentCable.js'
import DocumentEditor from '../DocumentEditor.js';
import DocumentOptions from '../DocumentOptions.js';
import Sidebar from '../Sidebar.js';
import CollaboratorList from '../CollaboratorList.js';

import operationFromTextChange from '../../src/operationFromTextChange.js';
import { restoreSelection, saveSelection } from '../../src/CaretPosition.js';

import { receivedDocument, receivedClientID, receivedCollaborator } from '../../actions';

const DOCUMENT_STATUS = {
  SYNC: "SYNC",
  WAITING_FOR_ACK: "WAITINGFORACK",
  WAITING_FOR_ACK_WITH_BUFFER: "WAITINGFORACKWITHBUFFER",
};

export default class DocumentContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: DOCUMENT_STATUS.SYNC,
      document: props.document,
      caretPosition: null,
      documentOptions: {
        syntaxMode: null,
      }
    };

    this.cable = new DocumentCable(props.document.name, {
      subscribedToDocument: (data) => this.props.dispatch(receivedClientID(data.client_id)),
      receivedDocument: (data) => this.props.dispatch(receivedDocument(data.document)),
      receivedOperation: this.receivedOperation.bind(this),
      receivedCollaborator: (data) => this.props.dispatch(receivedCollaborator(data.collaborator)),
    });

    this.handleInput = this.handleInput.bind(this);
    this.receivedRemoteOperation = this.receivedRemoteOperation.bind(this);
    this.receivedLocalOperation = this.receivedLocalOperation.bind(this);
    this.syntaxModeChanged = this.syntaxModeChanged.bind(this);
    this.setCaretPosition = this.setCaretPosition.bind(this);
    this.restoreCaretPosition = this.restoreCaretPosition.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ document: nextProps.document });
  }

  setCaretPosition(element) {
    const caretPosition = saveSelection(element);
    const oldCaretPosition = this.state.caretPosition;

    if (!oldCaretPosition ||
        caretPosition.start != oldCaretPosition.start ||
        caretPosition.end != oldCaretPosition.end) {
      this.setState({ caretPosition });
      this.cable.perform('update_caret_position', caretPosition);
    }
  }

  restoreCaretPosition(element, caretPosition) {
    restoreSelection(element, caretPosition);
  }

  receivedOperation(data) {
    const operation = ot.TextOperation.fromJSON(data.operation);

    if (data.client_id != this.props.clientID) {
      // if this operation was by someone else
      this.receivedRemoteOperation(operation);
    } else {
      // if this is an acknowledgment of one of our operations
      this.receivedLocalOperation(operation);
    }
  }

  receivedRemoteOperation(operation) {
    const { status, operationAwaitingAck, buffer, document } = this.state;

    if (status === DOCUMENT_STATUS.WAITING_FOR_ACK || status === DOCUMENT_STATUS.WAITING_FOR_ACK_WITH_BUFFER) {
      // if we have an operation pending acknowledgment from the server,
      // combine it with the newly received operation
      const pair = ot.TextOperation.transform(operationAwaitingAck, operation);

      this.setState({ operationAwaitingAck: pair[0] });
      operation = pair[1];

      if (status === DOCUMENT_STATUS.WAITING_FOR_ACK_WITH_BUFFER) {
        // if we have further operations pending in the buffer, combine them too
        const bufferPair = ot.TextOperation.transform(buffer, operation);

        this.setState({ buffer: bufferPair[0] });
        operation = bufferPair[1];
      }
    }

    const newDocument = {
      ...document,
      body: operation.apply(document.body)
    };

    this.props.dispatch(receivedDocument(newDocument));
  }

  receivedLocalOperation(operation) {
    const { status, document, buffer } = this.state;
    const { clientID } = this.props;

    if (status === DOCUMENT_STATUS.WAITING_FOR_ACK_WITH_BUFFER) {
      // send whats currently in our buffer
      this.cable.performOperation(buffer, clientID);

      // clear the current buffer, and set state to reflect that we're waiting for acknowledgment of the
      // previously buffered operations
      this.setState({
        buffer: null,
        operationAwaitingAck: buffer,
        status: DOCUMENT_STATUS.WAITING_FOR_ACK,
      });
    } else if (status === DOCUMENT_STATUS.WAITING_FOR_ACK) {
      // everything is fine now
      this.setState({
        operationAwaitingAck: null,
        status: DOCUMENT_STATUS.SYNC,
      });
    }
  }

  handleInput(newContent) {
    const { status, document, buffer } = this.state;
    const operation = operationFromTextChange(document.body, newContent);

    if (operation.ops.length === 0) {
      return;
    }

    const newDocument = {
      ...document,
      body: newContent,
    };

    this.props.dispatch(receivedDocument(newDocument));

    if (status === DOCUMENT_STATUS.SYNC) {
      // send this new operation to the server
      this.cable.performOperation(operation, this.props.clientID);

      // set state to reflect the fact that we're now waiting for acknowledgment of this operation
      this.setState({
        operationAwaitingAck: operation,
        status: DOCUMENT_STATUS.WAITING_FOR_ACK,
      });
    } else if (status === DOCUMENT_STATUS.WAITING_FOR_ACK) {
      // if we are awaiting acknowledgment for a previous operation, start a buffer
      this.setState({
        buffer: operation,
        status: DOCUMENT_STATUS.WAITING_FOR_ACK_WITH_BUFFER,
      });
    } else if (status === DOCUMENT_STATUS.WAITING_FOR_ACK_WITH_BUFFER) {
      // if we already have a buffer, add the new operation to the buffer
      this.setState({ buffer: buffer.compose(operation), });
    }
  }

  syntaxModeChanged(syntaxMode) {
    this.setState({
      documentOptions: { syntaxMode }
    })
  }

  render() {
    const { document, clientID, dispatch } = this.props;
    const { documentOptions, caretPosition } = this.state;

    return (
      <div>
        <DocumentEditor
          {...this.props}
          caretPosition={caretPosition}
          setCaretPosition={this.setCaretPosition}
          restoreCaretPosition={this.restoreCaretPosition}
          documentOptions={documentOptions}
          handleInput={this.handleInput}
          ref={doc => this.document = doc}
        />

        <Sidebar>
          <CollaboratorList
            cable={this.cable}
            collaborators={document.collaborators}
            clientID={clientID}
            dispatch={dispatch}
          />

          <DocumentOptions
            syntaxModeChanged={this.syntaxModeChanged}
          />
        </Sidebar>
      </div>
    );
  }
}
