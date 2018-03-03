class Operation < ApplicationRecord
  belongs_to :document
  # belongs_to :collaborator

  def ops
    JSON.parse body
  end
end
