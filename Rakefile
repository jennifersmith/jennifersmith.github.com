require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

task :default => "site:generate"
namespace :site do
	task :generate do
		sh "jekyll --pygments"
	end
	task :background do
		sh "jekyll --auto --pygments"
	end
	task :run do
		sh "node _node/file-server.js"
	end
end

