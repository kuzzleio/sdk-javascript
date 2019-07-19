import io.kuzzle.sdk.*;
import java.util.Date;

public class CodeExampleGenericClass {
    private static Kuzzle kuzzle;

    public static void main(String[] args) {
      WebSocket ws = new WebSocket("kuzzle");
      kuzzle = new Kuzzle(ws);
      kuzzle.connect();
      [snippet-code]
    }
}
