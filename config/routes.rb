Rails.application.routes.draw do
  resources :documents, only: [:show, :new]

  root to: "welcome#index"
end
