# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170723204000) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "collaborators", force: :cascade do |t|
    t.bigint "document_id"
    t.string "client_id"
    t.string "client_alias"
    t.string "status"
    t.datetime "created_at"
    t.index ["document_id"], name: "index_collaborators_on_document_id"
  end

  create_table "documents", force: :cascade do |t|
    t.string "name"
    t.text "body", default: "hello, world!", null: false
    t.integer "version", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "operations", force: :cascade do |t|
    t.bigint "document_id"
    t.bigint "collaborator_id"
    t.text "body"
    t.integer "base_length"
    t.integer "target_length"
    t.integer "client_version", null: false
    t.datetime "created_at"
    t.index ["collaborator_id"], name: "index_operations_on_collaborator_id"
    t.index ["document_id"], name: "index_operations_on_document_id"
  end

end
