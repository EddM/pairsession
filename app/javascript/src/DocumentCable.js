import { env } from 'process';
import ActionCable from 'actioncable';

const CHANNEL_NAME = 'DocumentChannel';

export default class DocumentCable {
  constructor(documentName, callbacks) {
    this.documentName = documentName;
    this.callbacks = callbacks;
    this.cable = ActionCable.createConsumer(env.ACTION_CABLE_URL);

    this.subscription = this.cable.subscriptions.create({ channel: CHANNEL_NAME, document_name: this.documentName }, {
      connected: this.connected.bind(this),
      received: this.received.bind(this),
    });
  }

  perform(action, params) {
    this.subscription.perform(action, params);
  }

  performOperation(operation, clientID, clientVersion) {
    console.log(operation);
    this.subscription.perform('operation', {
      client_id: clientID,
      operation: operation,
      client_version: clientVersion,
    });
  }

  connected(data) {
    // we're connected, so lets download the full current state of the document
    this.subscription.perform('document_data');
  }

  received(data) {
    switch(data.action) {
      case 'subscribed':
        // subscribed to document updates
        this.callbacks.subscribedToDocument(data);
        break;
      case 'document':
        // received full document
        console.log('rec doc');
        this.callbacks.receivedDocument(data);
        break;
      case 'operation':
        // received an operation (update to the document)
        this.callbacks.receivedOperation(data);
        break;
      case 'collaborator':
        // received new info about a collaborator
        this.callbacks.receivedCollaborator(data);
        break;
    }
  }
}
