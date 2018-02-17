class DocumentChannel < ApplicationCable::Channel
  attr_reader :document, :collaborator, :client_id

  def subscribed
    @client_id = connection.client_id

    @document = Document.find_or_create_by(name: params[:document_name])
    @collaborator = document.collaborators.find_or_create_by(client_id: client_id)

    if collaborator.valid?
      collaborator.active!

      ActionCable.server.broadcast "documents.#{document.name}.collaborators", action: "collaborator", collaborator: {
        id: collaborator.client_id,
        alias: collaborator.client_alias,
        status: collaborator.status
      }

      # tell the client that we successfully subscribed them to this document
      transmit action: "subscribed", client_id: client_id
    else
      # handle error
    end
  end

  def unsubscribed
    collaborator.inactive!

    ActionCable.server.broadcast "documents.#{document.name}.collaborators", action: "collaborator", collaborator: {
      id: collaborator.client_id,
      alias: collaborator.client_alias,
      status: collaborator.status
    }
  end

  def document_data(data)
    # send current document state
    collaborators = document.collaborators.map do |collaborator|
      [collaborator.client_id, {
        id: collaborator.client_id,
        alias: collaborator.client_alias,
        status: collaborator.status
      }]
    end.to_h

    transmit action: "document", document: {
      body: document.body,
      collaborators: collaborators,
      version: document.version
    }

    # stream all document operations to the client
    stream_from "documents.#{document.name}.operations"
    stream_from "documents.#{document.name}.collaborators"
  end

  def operation(data)
    # turn the serialized operation into an operation object
    data = ActiveSupport::HashWithIndifferentAccess.new(data)
    operation = OT::TextOperation.from_a(data[:operation])
    client_version = data[:client_version]

    # apply it to the document
    if document.apply_operation(operation, client_version)
      # broadcast the change to all subscribed
      ActionCable.server.broadcast "documents.#{document.name}.operations", {
        action: "operation",
        operation: operation.to_a,
        version: client_version,
        client_id: data[:client_id]
      }
    else
      # handle error
    end
  end

  def update_collaborator(data)
    return unless data["alias"].size >= 3 # TODO: move to model validation

    collaborator.update client_alias: data["alias"]
    broadcast_collaborator
  end

  def update_caret_position(data)
    collaborator.caret_position = [data["start"].to_i, data["end"].to_i]
    broadcast_collaborator
  end

  private

  def broadcast_collaborator
    ActionCable.server.broadcast "documents.#{document.name}.collaborators", action: "collaborator", collaborator: {
      id: collaborator.client_id,
      alias: collaborator.client_alias,
      status: collaborator.status,
      caret_position: collaborator.caret_position
    }
  end
end
