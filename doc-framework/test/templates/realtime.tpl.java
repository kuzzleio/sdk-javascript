import io.kuzzle.sdk.*;
import java.util.Date;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class CodeExampleGenericClass {
    private static Kuzzle kuzzle;

    public static void main(String[] args) {
      WebSocket ws = new WebSocket("kuzzle");
      kuzzle = new Kuzzle(ws);
      kuzzle.connect();

      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      PrintStream ps = new PrintStream(baos);
      PrintStream outOriginal = System.out;

      System.setOut(ps);

      [snippet-code]

      for (int i = 150; i > 0 && baos.size() == 0; --i) {
        try {
          Thread.sleep(200);
        } catch (InterruptedException e) {
          System.err.println(e.getMessage());
        }
      }

      System.out.flush();
      System.setOut(outOriginal);
      System.out.println(baos.toString());
    }
}
