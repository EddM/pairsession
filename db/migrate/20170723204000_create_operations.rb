class CreateOperations < ActiveRecord::Migration[5.1]
  def change
    create_table :operations do |t|
      t.references :document
      t.references :collaborator
      t.text :body
      t.integer :base_length
      t.integer :target_length
      t.integer :client_version, null: false
      t.timestamp :created_at
    end
  end
end
