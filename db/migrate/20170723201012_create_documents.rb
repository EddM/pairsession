class CreateDocuments < ActiveRecord::Migration[5.1]
  def change
    create_table :documents do |t|
      t.string :name
      t.text :body, default: "hello, world!", null: false
      t.integer :version, null: false, default: 0
      t.timestamps
    end
  end
end
