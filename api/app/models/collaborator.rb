class Collaborator
  attr_reader :client_id, :client_alias, :status

  def initialize(client_id)
    @client_id = client_id
    @connection = Redis.new
    @key = "collaborators:#{@client_id}"

    unless @client_alias = @connection.hget(@key, "alias")
      @client_alias = self.class.random_alias
      @connection.hmset @key, "alias", @client_alias
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

  def self.random_alias
    "user-#{rand(1000)}"
  end
end
