require 'byebug'
require 'fileutils'

class String
  def kebabcase
    self.gsub(/::/, '/').
    gsub(/([A-Z]+)([A-Z][a-z])/,'\1_\2').
    gsub(/([a-z\d])([A-Z])/,'\1_\2').
    tr("-", "_").
    downcase
    .gsub('_', '-')
  end
end

Dir['./src/sdk/cpp/1/controllers/document/**'].each do |entry|
  next unless File.directory?(entry)
  method_name = File.basename(entry).kebabcase
  path = entry.split('/')[0..-2].join('/')
  new_entry = "#{path}/#{method_name}"

  next if entry == new_entry

  FileUtils.mv(entry, new_entry)
end
