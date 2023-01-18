let NODE_DEBUG;

const { isBrowser, getBrowserWindow } = require("./browser");

/* eslint no-undef: 0 */

function shouldDebug() {
  /**
   * Some framework like react-native or other might emulate the window object
   * but when on plateforms like iOS / Android, the window.location is undefined.
   *
   * So we need to check if window.location is defined before using it otherwise
   * we will get an error.
   *
   * If something went wrong, be sure to return false to avoid any error.
   */
  try {
    if (!isBrowser()) {
      // Avoid multiple calls to process.env
      if (!NODE_DEBUG) {
        NODE_DEBUG = (process.env.DEBUG || "").includes("kuzzle-sdk");
      }

      return NODE_DEBUG;
    }

    const window = getBrowserWindow();
    return (
      window.debugKuzzleSdk ||
      (window.location &&
        new URL(window.location).searchParams.get("debugKuzzleSdk") !== null)
    );
  } catch (e) {
    return false;
  }
}

/**
 * Print debug only if activated
 *
 * In Node.js, you can set the `DEBUG=kuzzle-sdk` env variable.
 * In a browser, you can add the `?debugKuzzleSdk` in the URL
 * or set `window.debugKuzzleSdk` = true
 */
function debug(message, obj) {
  if (!shouldDebug()) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log(message);

  if (obj) {
    // Browser console can print directly objects
    const toPrint = !isBrowser() ? JSON.stringify(obj) : obj;

    // eslint-disable-next-line no-console
    console.log(toPrint);
  }
}

module.exports = { debug };
