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
    collaborators = document.collaborators.map do |c|
      [c.client_id, {
        id: collaborator.client_id,
        alias: collaborator.client_alias,
        status: collaborator.status
      }]
    end.to_h

    transmit action: "document", document: { contents: document.body, collaborators: collaborators }

    # stream all document operations to the client
    stream_from "documents.#{document.name}.operations"
    stream_from "documents.#{document.name}.collaborators"
  end

  def operation(data)
    # turn the serialized operation into an operation object
    data = ActiveSupport::HashWithIndifferentAccess.new(data)
    operation = OT::TextOperation.from_a(data[:operation])

    # apply it to the document
    if document.apply_operation(operation)
      # broadcast the change to all subscribed
      ActionCable.server.broadcast "documents.#{document.name}.operations", data
    else
      # handle error
    end
  end

  def update_collaborator(data)
    return unless data["alias"].size >= 3 # TODO: move to model validation

    collaborator.update client_alias: data["alias"]

    ActionCable.server.broadcast "documents.#{document.name}.collaborators", action: "collaborator", collaborator: {
      id: collaborator.client_id,
      alias: collaborator.client_alias,
      status: collaborator.status
    }
  end
end
