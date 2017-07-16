class DocumentChannel < ApplicationCable::Channel
  attr_reader :client_id

  def subscribed
    @client_id = connection.client_id

    collaborator = Collaborator.new(@client_id)
    collaborator.active!

    document = Document.new("foo")
    document.collaborators << collaborator

    ActionCable.server.broadcast "documents.#{document.name}.collaborators", action: "collaborator", collaborator: {
      id: collaborator.client_id,
      alias: collaborator.client_alias,
      status: collaborator.status
    }

    # tell the client that we successfully subscribed them to this document
    transmit action: "subscribed", client_id: @client_id
  end

  def unsubscribed
    document = Document.new("foo")

    collaborator = Collaborator.new(@client_id)
    collaborator.inactive!

    ActionCable.server.broadcast "documents.#{document.name}.collaborators", action: "collaborator", collaborator: {
      id: collaborator.client_id,
      alias: collaborator.client_alias,
      status: collaborator.status
    }
  end

  def document(data)
    document = Document.new("foo")

    # send current document state
    transmit action: "document",
             document: {
               contents: document.value,
               collaborators: document.collaborators.to_h
             }

    # stream all document operations to the client
    stream_from "documents.#{document.name}.operations"
    stream_from "documents.#{document.name}.collaborators"
  end

  def operation(data)
    # turn the serialized operation into an operation object
    data = ActiveSupport::HashWithIndifferentAccess.new(data)
    operation = OT::TextOperation.from_a(data[:operation])

    # apply it to the document
    document = Document.new("foo")
    document.apply_operation operation

    # broadcast the change to all subscribed
    ActionCable.server.broadcast "documents.#{document.name}.operations", data
  end

  def collaborator(data)
    document = Document.new("foo")
    collaborator = Collaborator.new(@client_id)
    collaborator.set_alias! data["alias"] if data["alias"].size >= 3

    ActionCable.server.broadcast "documents.#{document.name}.collaborators", action: "collaborator", collaborator: {
      id: collaborator.client_id,
      alias: collaborator.client_alias,
      status: collaborator.status
    }
  end
end
