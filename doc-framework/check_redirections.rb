require 'yaml'
require 'json'

def each_dir(start, &block)
  directories = Dir["#{start}/*"]

  directories.each do |path|
    if File.file?(path)
      block.call(path)
    else
      each_dir(path, &block)
    end
  end
end

redirections = YAML.load_file('./redirections.yml')

v2_redir = []
v2_pages = []

redirections['redirections'].each do |redirection|
  each_dir("../documentation-v2/src/#{redirection['from']}") do |file|
    v2_redir << file.gsub('../documentation-v2/', '')
  end
end

each_dir("../documentation-v2/src/") do |file|
  next unless file.end_with?('.md')
  v2_pages << file.gsub('../documentation-v2/', '').gsub(/\/\//, '/')
end

v2_redir.uniq!
v2_pages.uniq!
missing_redirections = v2_pages - v2_redir

puts "#{v2_redir.count} redirection from v2 to v3"
puts "#{v2_pages.count} pages for v2"
puts "#{missing_redirections.count} missing redirections"

if missing_redirections.any?
  File.write('./missing-redirections.json', JSON.pretty_generate(missing_redirections))
end