require 'active_support/all'
require 'byebug'
require 'fileutils'

ADD_NAMESPACE = [
  /Kuzzle/,
  /query_options/,
  /room_options/,
  /SearchResult/,
  /NotificationListener/,
  /User/,
  /UserRight/,
  /token_validity/,
  /validation_response/,
  /Protocol/,
  /WebSocket/,
  /Event/,
  /kuzzle_response/,
  /kuzzle_request/
]

class String
  def camelcaselow
    self.split('_').inject([]){ |buffer,e| buffer.push(buffer.empty? ? e : e.capitalize) }.join
  end
end

class SignatureExtractor
  def initialize(sig_regexp_evaluator, file_name_evaluator)
    @sig_regexp_evaluator = sig_regexp_evaluator
    @file_name_evaluator = file_name_evaluator
  end

  def extract(controller, action, &block)
    action = action.underscore.camelcaselow
    action = "delete_" if action == "delete"
    action = controller.camelcase if action == "constructor"
    content = File.read("#{@path}/#{@file_name_evaluator.call(controller)}")

    match = content.scan(@sig_regexp_evaluator.call(action))

    if match.empty?
      byebug
      return []
    end

    if block.nil?
      match.flatten.sort
    else
      match.flatten.sort.map(&block)
    end
  end
end

class SignatureExtractor::Cpp < SignatureExtractor
  SIGNATURE_REGEXP_EVALUATOR = -> (action_name) { /(.* #{action_name}\([^;]+)/ }
  FILE_NAME_EVALUATOR = -> (controller_name) { "#{controller_name.underscore}.hpp" }

  def initialize(path = nil)
    super(SIGNATURE_REGEXP_EVALUATOR, FILE_NAME_EVALUATOR)

    @path = path ||= "#{File.dirname(__FILE__)}/../../sdk-cpp/include/internal"
  end

  def extract(*args)
    super { |sig| "#{sig.squish}" }
  end
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

def signature_mutator(controller, action)
  content = []

  signatures = SignatureExtractor::Cpp.new.extract(controller, action)
  signatures = signatures.map do |signature|
    if signature.size > 80
      match = signature.match(/([<>\w\s\*:]+)\(([\w:&\s,\*<>]+)\)/)
      params = match[2].split(', ').map {|param| "\n    #{param}" }.join(", ")
      "#{match[1]}(#{params});"
    else
      "#{signature};"
    end
  end.map do |signature|
    ADD_NAMESPACE.each do |regexp|
      match = signature.match(regexp)
      unless match.nil?
        signature.gsub!(match[0], "kuzzleio::#{match[0]}")
      end
    end
    signature
  end

  content << "```cpp"
  content << signatures.join("\n\n")
  content << "```"

  content.join("\n")
end


each_dir(ARGV[0]) do |file|
  if file.end_with?('.md')
    file.gsub!(/\/\//, '/')
    parts = file.split('/')
    root = parts[0..1].join('/')
    sdk = parts[2]
    version = parts[3]
    controller = parts[4]
    action = parts[5]

    puts "#{controller}:#{action}"
    content = File.read(file)
    next if controller.in?(["search-result", "user", "user-right", "websocket", "protocol"])
    next if action.in?(["getters", "setters", "introduction"])
    if content.match(/```cpp[^`]+```/)
      puts file
      new_signature = signature_mutator(controller, action)
      byebug if new_signature.empty?
      content.gsub!(/##\s+Signature\n+```cpp[^`]+```/, "## Signature\n\n#{new_signature}")
      File.write(file, content)
    else
    end
  else
  end
end
