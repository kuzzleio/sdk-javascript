#include <unistd.h>
#include <iostream>
#include <string>
#include <ctime>
#include <vector>

#include "kuzzle.hpp"
#include "websocket.hpp"

int main() {
  std::string hostname = "kuzzle";

  kuzzleio::WebSocket* ws = new kuzzleio::WebSocket(hostname);
  kuzzleio::Kuzzle* kuzzle = new kuzzleio::Kuzzle(ws);

  try {
    kuzzle->connect();
  }
  catch (kuzzleio::KuzzleException e) {
    std::cerr << "Unable to connect to " << hostname << ":" << ws->getPort() << std::endl << e.what() << std::endl;
    return 1;
  }

  [snippet-code]

  kuzzle->disconnect();

  delete kuzzle;
  delete ws;

  return 0;
}
