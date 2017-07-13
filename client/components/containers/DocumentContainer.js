import React from 'react';
import ot from 'ot';

import DocumentCable from '../../src/DocumentCable.js'
import Document from '../Document.js';

import operationFromTextChange from '../../src/operationFromTextChange.js';
import { receivedDocumentContents, receivedClientID } from '../../actions';

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
    };

    this.cable = new DocumentCable('foo', {
      subscribedToDocument: this.subscribedToDocument.bind(this),
      receivedDocument: this.receivedDocument.bind(this),
      receivedOperation: this.receivedOperation.bind(this),
    });

    this.handleInput = this.handleInput.bind(this);
    this.receivedRemoteOperation = this.receivedRemoteOperation.bind(this);
    this.receivedLocalOperation = this.receivedLocalOperation.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ document: nextProps.document });
  }

  subscribedToDocument(data) {
    this.props.dispatch(receivedClientID(data.client_id));
  }

  receivedDocument(data) {
    this.props.dispatch(receivedDocumentContents(data.contents));
  }

  receivedOperation(data) {
    const operation = ot.TextOperation.fromJSON(data.operation);

    if (data.client_id != this.state.document.clientID) {
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

    this.props.dispatch(receivedDocumentContents(operation.apply(document.contents)));
  }

  receivedLocalOperation(operation) {
    const { status, document, buffer } = this.state;

    if (status === DOCUMENT_STATUS.WAITING_FOR_ACK_WITH_BUFFER) {
      // send whats currently in our buffer
      this.cable.perform("operation", { client_id: document.clientID, operation: buffer });

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

  handleInput(event) {
    const { status, document, buffer } = this.state;
    const newContent = event.target.value;
    const operation = operationFromTextChange(document.contents, newContent);

    this.props.dispatch(receivedDocumentContents(newContent));

    if (status === DOCUMENT_STATUS.SYNC) {
      // send this new operation to the server
      this.cable.perform("operation", { client_id: document.clientID, operation: operation });

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

  render() {
    return <Document {...this.props} handleInput={this.handleInput} ref={doc => this.document = doc} />;
  }
}
