class Operation < ApplicationRecord
  belongs_to :document
  belongs_to :collaborator
end
