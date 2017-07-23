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

  def self.random_alias
    "Coder_#{SecureRandom.hex(4)}"
  end
end
