class User < ApplicationRecord
  has_secure_password
  has_many :messages
  validates :email, :username, presence: true, uniqueness: true
  validates :password_digest, presence: true, length: {minimum: 6}
end
