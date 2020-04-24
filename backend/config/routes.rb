Rails.application.routes.draw do

  post 'user_token' => 'user_token#create'
  post 'find_user' => 'users#find'
  post 'set_user' => 'users#set_user'
  post 'user_rooms' => 'rooms#user_rooms'
  resources :users

  resources :rooms, only: [:index, :create, :show]
  resources :messages, only: [:create]

  mount Knock::Engine => '/knock'
  mount ActionCable.server => '/cable'
end
