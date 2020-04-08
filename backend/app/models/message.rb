class Message < ApplicationRecord
  validates_presence_of :content, :room_id
  belongs_to :room
end
