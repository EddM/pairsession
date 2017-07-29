class Document < ApplicationRecord
  has_many :collaborators
  has_many :operations

  before_create do |record|
    record.name ||= self.class.generate_name
  end

  def apply_operation(operation, client_version)
    unless client_version > version
      operation = transform_old_operation(operation, client_version)
    end

    transaction do
      operations.create body: operation.ops.to_json,
                        base_length: operation.base_length,
                        target_length: operation.target_length,
                        client_version: client_version

      self.body = operation.apply(body)
      save
    end

    operation
  end

  def size
    body.size
  end

  private

  def transform_old_operation(operation, client_version)
    operations.where("version > ?", client_version).find_each do |other_operation|
      operation = OT::TextOperation.transform(operation, other_operation).first
    end

    operation
  end

  def self.generate_name
    SecureRandom.hex(8)
  end
end
