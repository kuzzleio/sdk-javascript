try {
  kuzzle-><%= _.camelCase(controller) %>-><%= _.camelCase(action) %>();
  
  std::cout << "Success" << std::endl;
} catch (kuzzleio::KuzzleException &e) {
  std::cerr << e.getMessage() << std::endl;
}
