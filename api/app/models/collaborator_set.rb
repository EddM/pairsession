class CollaboratorSet
  def initialize(name)
    @name = name
    @connection = Redis.new
    @key = "documents:#{name}:collaborators"
  end

  def <<(collaborator)
    @connection.sadd(@key, collaborator.client_id)
  end

  # todo: clean up
  def to_h
    hash = {}
    collaborator_ids = @connection.smembers(@key)

    collaborator_ids.each do |collaborator_id|
      collaborator = @connection.hgetall "collaborators:#{collaborator_id}"

      hash[collaborator_id] = {
        id: collaborator_id,
        alias: collaborator["alias"],
        status: collaborator["status"]
      }
    end

    hash
  end
end
