# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
#
User.create(email: 'chris.kerbo@outlook.com', password: 'testing')
User.create(email: 'eric', password: 'testing')
Room.create(name: 'General', user_id: 1)
Room.create(name: 'Private', user_id: 1)
Room.create(name: 'Team A', user_id: 2)
Message.create(content: 'This is a test message.', room_id: 1, user_id: 1)
Message.create(content: 'This is a test message.', room_id: 2, user_id: 1)
Message.create(content: 'This is a test message.', room_id: 3, user_id: 2)