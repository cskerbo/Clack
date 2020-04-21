class Room < ApplicationRecord
  validates_presence_of :name
  has_many :users
  has_many :messages
end
