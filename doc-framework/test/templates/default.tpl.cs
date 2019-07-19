using Kuzzleio;
using System;

public class Example {
  static void Main() {
    WebSocket ws = new WebSocket("kuzzle");
    Kuzzle k = new Kuzzle(ws);

    k.connect();

    [snippet-code]
  }
}
