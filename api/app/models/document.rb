require 'redis'

# Represents a document
class Document # < ApplicationRecord
  attr_reader :name, :value

  def initialize(name)
    @connection = Redis.new
    @key = "f_#{name}"
    set_value
    save!
  end

  def apply_operation(op)
    @value = op.apply(@value)
    save!

    @value
  end

  def size
    @value.size
  end

  def set_value
    @value = @connection.get(@key) || 'hello, world'
  end

  private

  def save!
    @connection.set @key, @value
  end
end
