Rails.application.routes.draw do
  resources :rooms, only: [:index, :create, :show]
  resources :messages, only: [:create]

  mount ActionCable.server => '/cable'
end
