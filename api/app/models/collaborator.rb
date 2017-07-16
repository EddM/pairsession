class Collaborator
  attr_reader :client_id, :client_alias, :status

  def initialize(client_id)
    @client_id = client_id
    @connection = Redis.new
    @key = "collaborators:#{@client_id}"

    unless @client_alias = @connection.hget(@key, "alias")
      set_alias! self.class.random_alias
    end

    unless @status = @connection.hget(@key, "status")
      @status = :active
      @connection.hmset @key, "status", @status
    end
  end

  def active!
    @status = :active
    @connection.hmset @key, "status", @status
  end

  def inactive!
    @status = :inactive
    @connection.hmset @key, "status", @status
  end

  def set_alias!(new_alias)
    @connection.hmset @key, "alias", new_alias
    @client_alias = new_alias
  end

  def self.random_alias
    "Coder_#{SecureRandom.hex(4)}"
  end
end
