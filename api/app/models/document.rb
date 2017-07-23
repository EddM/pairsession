class Document < ApplicationRecord
  DEFAULT_BODY = "hello, world!"

  has_many :collaborators
  has_many :operations

  before_create do |record|
    record.body ||= DEFAULT_BODY
  end

  def apply_operation(op)
    transaction do
      operations.create body: op.ops.to_json,
                        base_length: op.base_length,
                        target_length: op.target_length

      self.body = op.apply(body)
      save
    end
  end

  def size
    body.size
  end
end
