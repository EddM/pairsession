class Document < ApplicationRecord
  has_many :collaborators
  has_many :operations

  before_create do |record|
    record.name ||= Document.generate_name
  end

  def apply_operation(operation, client_version)
    with_lock do
      unless client_version > version
        operation = transform_old_operation(operation, client_version)
      end

      operations.create body: operation.ops.to_json,
                        base_length: operation.base_length,
                        target_length: operation.target_length,
                        client_version: client_version

      new_body = operation.apply(body)
      self.body = new_body
      self.version = client_version
      save!
      Rails.cache.write body_cache_key, new_body
      Rails.cache.write [id, :version], client_version
    end

    operation
  end

  def version
    Rails.cache.fetch [id, :version] do
      read_attribute :version
    end
  end

  def body
    Rails.cache.fetch body_cache_key do
      reload
      read_attribute :body
    end
  end

  def size
    body.size
  end

  private

  def body_cache_key
    [id, :body]
  end

  def transform_old_operation(operation, client_version)
    operations.where("client_version >= ?", client_version).find_each do |other_operation|
      operation = OT::TextOperation.transform(operation, other_operation).first
    end

    operation
  end

  class << self
    def generate_name
      SecureRandom.hex(4)
    end
  end
end
