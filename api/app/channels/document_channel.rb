class DocumentChannel < ApplicationCable::Channel
  def subscribed
    @client_id = SecureRandom.uuid

    transmit action: "subscribed", client_id: @client_id
    stream_from "documents.foo.operations"
  end

  # def document(data)
  #   document = Document.new(data['name'])

  #   # @documents ||= []
  #   # @documents << document

  #   # send_attribute_versions(document)

  #   stream_from "documents.foo.operations"
  # end

  def operation(data)
    data = ActiveSupport::HashWithIndifferentAccess.new(data)
    operation = OT::TextOperation.from_a(data[:operation])

    document = Document.new("foo")
    document.apply_operation operation

    ActionCable.server.broadcast 'documents.foo.operations', data
  end
end
