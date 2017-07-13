class DocumentChannel < ApplicationCable::Channel
  def subscribed
    @client_id = SecureRandom.uuid

    # tell the client that we successfully subscribed them to this document
    transmit action: "subscribed", client_id: @client_id
  end

  def document(data)
    document = Document.new("foo")

    # send current document state
    transmit action: "document", contents: document.value

    # stream all document operations to the client
    stream_from "documents.#{document.name}.operations"
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
end
