import ActionCable from 'actioncable';

const CHANNEL_NAME = 'DocumentChannel';

export default class DocumentCable {
  constructor(documentName, callbacks) {
    this.documentName = documentName;
    this.callbacks = callbacks;
    this.cable = ActionCable.createConsumer('ws://localhost:3000/cable')

    this.subscription = this.cable.subscriptions.create({ channel: CHANNEL_NAME, document_name: this.documentName }, {
      connected: this.connected.bind(this),
      received: this.received.bind(this),
    });
  }

  perform(action, params) {
    this.subscription.perform(action, params);
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
