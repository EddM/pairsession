class CreateCollaborators < ActiveRecord::Migration[5.1]
  def change
    create_table :collaborators do |t|
      t.references :document
      t.string :client_id
      t.string :client_alias
      t.string :status
      t.timestamp :created_at
    end
  end
end
