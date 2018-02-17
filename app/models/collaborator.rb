class Collaborator < ApplicationRecord
  belongs_to :document

  before_create do |record|
    record.client_alias ||= Collaborator.random_alias
  end

  def active!
    self.status = "active"
    save
  end

  def inactive!
    self.status = "inactive"
    save
  end

  def caret_position
    Rails.cache.read([id, :caret_position]) || [0, 0]
  end

  def caret_position=(position)
    Rails.cache.write([id, :caret_position], position)
  end

  def self.random_alias
    "Coder_#{SecureRandom.hex(4)}"
  end
end
