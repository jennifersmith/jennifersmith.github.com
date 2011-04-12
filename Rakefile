require "rubygems"
require "bundler"
require 'digest/md5'

Bundler.setup
require 'source/_helpers'

site_url    = "http://jennifersmith.co.uk"   # deployed site url for sitemap.xml generator
port        = "4000"      # preview project port eg. http://localhost:4000
 site       = "site/public"      # compiled site directory
source      = "source"    # source file directory
stash       = "_stash"    # directory to stash posts for speedy generation
posts       = "_posts"    # directory for blog files
post_format = "markdown"  # file format for new posts when using the post rake task

## -- Rsync Deploy config -- ##
ssh_user      = "user@host.com"    # for rsync deployment
document_root = "~/document_root/" # for rsync deployment
## ---- ##

## -- Github Pages deploy config -- ##
# Read http://pages.github.com for guidance
# If you're not using this, you can remove it
source_branch = "source" # this compiles to your deploy branch
deploy_branch = "master" # For user pages, use "master" for project pages use "gh-pages"
## ---- ##

def ok_failed(condition)
  if (condition)
    puts "OK"
  else
    puts "FAILED"
  end
end

## if you're deploying with github, change the default deploy to deploy_github
desc "default deploy task"
task :deploy => [:deploy_heroku] do
end

desc "Generate and deploy task"
task :generate_deploy => [:integrate, :generate, :clean_debug, :deploy] do
end

desc "generate website in output directory"
task :generate => [:generate_site, :generate_style, :generate_heroku] do
  puts ">>> Site Generating Complete! <<<\n\n>>> Refresh your browser <<<"
end

# usage rake post[my-new-post] or rake post['my new post'] or rake post (defaults to "new-post")
desc "Begin a new post in #{source}/_posts"
task :post, :filename do |t, args|
  args.with_defaults(:filename => 'new-post')
  open("#{source}/_posts/#{Time.now.strftime('%Y-%m-%d_%H-%M')}-#{args.filename.downcase.gsub(/[ _]/, '-')}.#{post_format}", 'w') do |post|
    post.puts "---"
    post.puts "title: \"#{args.filename.gsub(/[-_]/, ' ').titlecase}\""
    post.puts "---"
  end
end

# usage rake isolate[my-post]
desc "Move all other posts than the one currently being worked on to a temporary stash location (stash) so regenerating the site happens much quicker."
task :isolate, :filename do |t, args|
  stash_dir = "#{source}/#{stash}"
  FileUtils.mkdir(stash_dir) unless File.exist?(stash_dir)
  Dir.glob("#{source}/#{posts}/*.*") do |post|
    FileUtils.mv post, stash_dir unless post.include?(args.filename)
  end
end

desc "Move all stashed posts back into the posts directory, ready for site generation."
task :integrate do
  FileUtils.mv Dir.glob("#{source}/#{stash}/*.*"), "#{source}/#{posts}/"
end

desc "list tasks"
task :list do
  puts "Tasks: #{(Rake::Task.tasks - [Rake::Task[:list]]).to_sentence}"
  puts "(type rake -T for more detail)\n\n"
end

desc "remove files in output directory"
task :clean do
  puts ">>> Removing output <<<"
  Dir["#{site}/*"].each { |f| rm_rf(f) }
end

task :clean_debug do
  puts ">>> Removing debug pages <<<"
  Dir["#{site}/test"].each { |f| rm_rf(f) }
end

desc "Generate styles only"
task :generate_style do
  puts ">>> Generating styles <<<"
  system "compass compile"
end

desc "Generate site files only"
task :generate_site => [:clean, :generate_style] do
  puts "\n\n>>> Generating site files <<<"
  system "jekyll --pygments"
  system "mv #{site}/atom.html #{site}/atom.xml"
end

desc "Generate heroku files"
task :generate_heroku => [:clean, :generate_site] do
	puts "\n\n>>> Copying in stuff for heroku <<<\n\n"
	system "cp  heroku/* site"
	system "mv site/gems .gems"
end

def rebuild_site(relative)
  puts "\n\n>>> Change Detected to: #{relative} <<<"
  IO.popen('rake generate_site'){|io| print(io.readpartial(512)) until io.eof?}
  puts '>>> Update Complete <<<'
end

def rebuild_style(relative)
  puts "\n\n>>> Change Detected to: #{relative} <<<"
  IO.popen('rake generate_style'){|io| print(io.readpartial(512)) until io.eof?}
  puts '>>> Update Complete <<<'
end

desc "Watch the site and regenerate when it changes"
task :watch do
  require 'fssm'
  puts ">>> Watching for Changes <<<"
  FSSM.monitor do
    path "#{File.dirname(__FILE__)}/#{source}" do
      update {|base, relative| rebuild_site(relative)}
      delete {|base, relative| rebuild_site(relative)}
      create {|base, relative| rebuild_site(relative)}
    end
    path "#{File.dirname(__FILE__)}/stylesheets" do
      glob '**/*.sass'
      update {|base, relative| rebuild_style(relative)}
      delete {|base, relative| rebuild_style(relative)}
      create {|base, relative| rebuild_style(relative)}
    end
  end
end

desc "generate and deploy website via rsync"
multitask :deploy_rsync do
  puts ">>> Deploying website to #{site_url} <<<"
  ok_failed system("rsync -avz --delete #{site}/ #{ssh_user}:#{document_root}")
end

desc "generate and deploy website to github user pages"
multitask :deploy_github do
  puts ">>> Deploying #{deploy_branch} branch to Github Pages <<<"
  require 'git'
  repo = Git.open('.')
  puts "\n>>> Checking out #{deploy_branch} branch <<<\n"
  repo.branch("#{deploy_branch}").checkout
  (Dir["*"] - [site]).each { |f| rm_rf(f) }
  Dir["#{site}/*"].each {|f| mv(f, ".")}
  rm_rf(site)
  puts "\n>>> Moving generated site files <<<\n"
  Dir["**/*"].each {|f| repo.add(f) }
  repo.status.deleted.each {|f, s| repo.remove(f)}
  puts "\n>>> Commiting: Site updated at #{Time.now.utc} <<<\n"
  message = ENV["MESSAGE"] || "Site updated at #{Time.now.utc}"
  repo.commit(message)
  puts "\n>>> Pushing generated site to #{deploy_branch} branch <<<\n"
  repo.push
  puts "\n>>> Github Pages deploy complete <<<\n"
  repo.branch("#{source_branch}").checkout
end

multitask :deploy_heroku do
  puts ">>> Deploying #{deploy_branch} branch to heroku<<<"
  require 'git'
	sh "cd site"
  repo = Git.open('site')
  puts "\n>>> Checking out #{deploy_branch} branch <<<\n"
  repo.branch("#{deploy_branch}").checkout
  puts "\n>>> Moving generated site files <<<\n"
  Dir["site/**/*"].each {|f| repo.add(f.gsub("site/", "")) }
  repo.status.deleted.each {|f, s| repo.remove(f)}
  if(repo.status.changed.empty?) 
		puts "\n>>> Nothing to commit!<<<\n"
	else
		puts "\n>>> Commiting: Site updated at #{Time.now.utc} <<<\n"
  	message = ENV["MESSAGE"] || "Site updated at #{Time.now.utc}"
  	repo.commit(message)
	end
	puts "\n>>> Pushing generated site to #{deploy_branch} branch <<<\n"
  repo.push repo.remote("heroku")
  puts "\n>>> Github Pages deploy complete <<<\n"
  repo.branch("#{source_branch}").checkout
end


desc "start up an instance of serve on the output files"
task :start_serve => :stop_serve do
  cd "#{site}" do
    print "Starting serve..."
    system("serve #{port} > /dev/null 2>&1 &")
    sleep 1
    pid = `ps auxw | awk '/bin\\/serve\\ #{port}/ { print $2 }'`.strip
    ok_failed !pid.empty?
    system "open http://localhost:#{port}" unless pid.empty?
  end
end

desc "stop all instances of serve"
task :stop_serve do
  pid = `ps auxw | awk '/bin\\/serve\\ #{port}/ { print $2 }'`.strip
  if pid.empty?
    puts "Serve is not running"
  else
    print "Stoping serve..."
    ok_failed system("kill -9 #{pid}")
  end
end

desc "preview the site in a web browser"
task :preview => [:generate, :start_serve, :watch]

desc "Build an XML sitemap of all html files."
task :sitemap do
  html_files = FileList.new("#{site}/**/*.html").map{|f| f[("#{site}".size)..-1]}.map do |f|
    if f.ends_with?("index.html")
      f[0..(-("index.html".size + 1))]
    else
      f
    end
  end.sort_by{|f| f.size}
  open("#{site}/sitemap.xml", 'w') do |sitemap|
    sitemap.puts %Q{<?xml version="1.0" encoding="UTF-8"?>}
    sitemap.puts %Q{<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">}
    html_files.each do |f|
      priority = case f
      when %r{^/$}
        1.0
      when %r{^/articles}
        0.9
      else
        0.8
      end
      sitemap.puts %Q{  <url>}
      sitemap.puts %Q{    <loc>#{site_url}#{f}</loc>}
      sitemap.puts %Q{    <lastmod>#{Time.now.strftime('%Y-%m-%d')}</lastmod>}
      sitemap.puts %Q{    <changefreq>weekly</changefreq>}
      sitemap.puts %Q{    <priority>#{priority}</priority>}
      sitemap.puts %Q{  </url>}
    end
    sitemap.puts %Q{</urlset>}
    puts "Created #{site}/sitemap.xml"
  end
end

namespace :assets do  
  desc "Deploy all assets in public/**/* to S3/Cloudfront"
  task :deploy, :env, :branch do |t, args|

		credentials = YAML::load( File.open( 'aws' ) )
		## Use the `s3` gem to connect my bucket
    puts "== Uploading assets to S3/Cloudfront"

    service = S3::Service.new(
      :access_key_id => credentials["AWS_ACCESS_KEY_ID"],
      :secret_access_key => credentials["AWS_SECRET_ACCESS_KEY"])
    bucket = service.buckets.find(credentials["AWS_BUCKET"])

## Needed to show progress
    STDOUT.sync = true

## Find all files (recursively) in ./public and process them.
    Dir.glob("site/**/*").each do |file|

## Only upload files, we're not interested in directories
      if File.file?(file)

## Slash 'public/' from the filename for use on S3
        remote_file = file.gsub("site/", "")

## Try to find the remote_file, an error is thrown when no
## such file can be found, that's okay.  
        begin
          obj = bucket.objects.find_first(remote_file)
        rescue
          obj = nil
        end

## If the object does not exist, or if the MD5 Hash / etag of the 
## file has changed, upload it.
        if !obj || (obj.etag != Digest::MD5.hexdigest(File.read(file)))
            print "U"

## Simply create a new object, write the content and set the proper 
## mime-type. `obj.save` will upload and store the file to S3.
            obj = bucket.objects.build(remote_file)
            obj.content = open(file)
            obj.content_type = MIME::Types.type_for(file).to_s
            obj.save
        else
          print "."
        end
      end
    end
    STDOUT.sync = false # Done with progress output.

    puts
    puts "== Done syncing assets"
  end
end
