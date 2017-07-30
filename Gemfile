source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

# core
gem 'rails', '~> 5.1.2'
gem 'pg'
gem 'puma', '~> 3.7'
gem 'redis'
gem 'dalli'

# assets
gem 'sprockets-rails'
gem 'sass-rails'
gem 'uglifier'
gem 'webpacker', '~> 2.0'

# document logic
gem 'ot'

group :development, :test do
  gem "sqlite3"
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
end

group :development do
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
