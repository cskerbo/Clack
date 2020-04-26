class User < ApplicationRecord
  has_secure_password
  has_many :messages
  has_one_attached :avatar
  validates :email, :username, presence: true, uniqueness: true
  validates :password, presence: true, length: {minimum: 6}
  normalize_attribute :email, :with => :strip
end
