Rails.application.routes.draw do
  resources :documents, only: [:show]

  root to: "welcome#index"
end
