class Room < ApplicationRecord
  validates_presence_of :name
  has_many :messages
  belongs_to :user
  has_many :users
end
