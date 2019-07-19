require 'json'
require 'uri'
require 'typhoeus'
require 'optparse'
require 'set'

class LinkChecker
  INTERNAL_LINK_REGEXPS = [
    /\[[:\.\w\s\-]+\]\((\/[\w\/\-\#]*)\)/,
    /<a href="(\/[\w\/\-\#]*)">/
  ]

  IGNORED_EXTERNAL_LINKS = [
    'http://kuzzle:7512',
    'http://localhost',
    'http://<',
    'http://elasticsearch',
    'http:head',
    'http:options',
    'http:post',
    'http:put',
    'http:get',
    'http:delete',
    'http:patch',
    'http://...',
    'https://s3.eu-west-3.amazonaws.com',
    'http://s3.amazonaws.com/doc/2006-03-01'
  ]

  attr_reader :internal, :external

  def initialize(options)
    @path = options[:path]
    @only = options[:only] || ''
    @json_file = options[:file] || './dead_links.json'

    @hydra = Typhoeus::Hydra.new(max_concurrency: ENV['HYDRA_MAX_CONCURRENCY'] || 200)

    @internal = Set.new
    @external = Set.new
  end

  def run
    each_dir(@path) do |file_path|
      next unless file_path.end_with?('.md')

      content = File.read(file_path)

      scan_internal_links(file_path, content) unless @only == 'external'

      scan_external_links(file_path, content) unless @only == 'internal'
    end
    puts "Checking #{@hydra.queued_requests.count} external links.."
    @hydra.run
  end

  def report_stdout
    puts "Found #{@internal.count} uniq internal dead links:\n"
    puts @internal.to_a
    puts

    puts "Found #{@external.count} uniq external dead links:\n"
    puts @external.to_a
    puts
  end

  def report_json
    puts "JSON report available at #{@json_file}"
    File.write(@json_file, JSON.pretty_generate({ external: @external.to_a, internal: @internal.to_a }))
  end

  def exit_code
    return 1 if @internal.count > 0 || @external.count > 0
    return 0
  end

  private

  def scan_internal_links(file_path, content)
    INTERNAL_LINK_REGEXPS.each do |regexp|
      match = content.scan(regexp)
      match.each do |(relative_path)|
        # Remove anchor
        relative_path.gsub!(/#[\w-]+/, '')

        if relative_path.end_with?('/')
          full_path = "src/#{relative_path}/index.md"
        else
          full_path = "src/#{relative_path}"
        end

        # Remove double //
        full_path.gsub!(/\/\//, '/')

        next if File.exists?(full_path)

        @internal << full_path
      end
    end
  end

  def scan_external_links(file_path, content)
    external_links = URI.extract(content, ['http', 'https'])

    external_links.delete_if do |external_link|
      external_link.start_with?(*IGNORED_EXTERNAL_LINKS) ||
      external_link == 'http://' ||
      external_link == 'https://'
    end.each do |external_link|
      # Remove markdown closing parenthesis and everything following it
      external_link.gsub!(/[\)].*/, '')

      check_external_link(external_link) do |dead_link|
        @external << "#{dead_link} -> #{status}"
      end
    end
  end

  def check_external_link(link, try = 3, &block)
    request = Typhoeus::Request.new(link, followlocation: true)

    request.on_complete do |response|
      next if response.code == 200

      # After 3 retry, the link is really dead
      if try == 0
        yield link, response.code
      else
        check_external_link(link, try - 1, &block)
      end
    end

    @hydra.queue(request)
  end

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
end

options = {}

OptionParser.new do |opt|
  opt.on('-p PATH') { |o| options[:path] = o }
  opt.on('--only TYPE') { |o| options[:only] = o }
  opt.on('--output FILE') { |o| options[:file] = o }
end.parse!

if options[:path].nil?
  puts "Usage: ruby check_link.rb -p <path>"
  exit 1
end

link_checker = LinkChecker.new(options)

link_checker.run

link_checker.report_stdout
link_checker.report_json

exit link_checker.exit_code
