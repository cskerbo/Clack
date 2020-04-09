Rails.application.routes.draw do
  devise_for :users,
             path: '',
             path_names: {
                 sign_in: 'login',
                 sign_out: 'logout',
                 registration: 'signup'
             },
             controllers: {
                 sessions: 'sessions',
                 registrations: 'registrations'
             }
  resources :rooms, only: [:index, :create, :show]
  resources :messages, only: [:create]

  mount ActionCable.server => '/cable'
end
