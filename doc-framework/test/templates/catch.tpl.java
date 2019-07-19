import io.kuzzle.sdk.*;

public class CodeExampleGenericClass {
    private static Kuzzle kuzzle;

    public static void main(String[] args) {
      WebSocket ws = new WebSocket("kuzzle");
      kuzzle = new Kuzzle(ws);
      kuzzle.connect();
      try {
        [snippet-code]
      } catch (KuzzleException e) {
        System.out.println("Success");
      }
    }
}
