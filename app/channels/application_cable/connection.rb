module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :client_id

    def connect
      reject_unauthorized_connection unless cookies[:client_id].present?
      self.client_id = cookies[:client_id]
    end
  end
end
