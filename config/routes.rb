Rails.application.routes.draw do
  match '/ai_templates' => 'react#index', via: :get

  namespace :api do
    namespace :v2 do
      resources :ai_templates, only: [:create]
    end
  end
end
