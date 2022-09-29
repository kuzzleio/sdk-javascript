"use strict";

/**
 * Hilight user code
 *
 * e.g.
 *      at HttpProtocol.query (/home/aschen/projets/kuzzleio/sdk-javascript/src/protocols/abstract/Base.ts:127:19)
 *      at Proxy.query (/home/aschen/projets/kuzzleio/sdk-javascript/src/Kuzzle.ts:598:26)
 * >  at /home/aschen/projets/kuzzleio/sdk-javascript/test.js:8:18
 *      at processTicksAndRejections (internal/process/task_queues.js:97:5)]
 */
function hilightUserCode(line) {
  // ignore first line (error message)
  if (!line.includes(" at ")) {
    return line;
  }

  if (
    line.includes("sdk-javascript/src/") || // ignore kuzzle code
    (line.indexOf("at /") === -1 &&
      line.charAt(line.indexOf("(") + 1) !== "/") || // ignore node internal
    line.includes("node_modules") // ignore dependencies
  ) {
    return "   " + line;
  }

  // hilight user code
  return ">" + line;
}

module.exports = {
  hilightUserCode,
};
