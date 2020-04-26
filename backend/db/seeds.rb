# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
#
User.create(email: 'chris@gmail.com', username: 'Chris', password: 'testing')
User.create(email: 'eric@gmail.com', username: 'Eric', password: 'testing')
User.create(email: 'nancy@gmail.com', username: 'Nancy', password: 'testing')
Room.create(name: 'General')
Room.create(name: 'Social')
Room.create(name: 'Customer Service')
Room.create(name: 'Purchasing')
Room.create(name: 'Order Processing')