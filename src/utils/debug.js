let NODE_DEBUG;

function shouldDebug () {
  if (typeof window === 'undefined') {
    // Avoid multiple calls to process.env
    if (! NODE_DEBUG) {
      NODE_DEBUG = (process.env.DEBUG || '').includes('kuzzle-sdk');
    }

    return NODE_DEBUG;
  }

  const url = new URL(window.location);

  return window.debugKuzzleSdk || url.searchParams.get('debugKuzzleSdk') !== null;
}

/**
 * Print debug only if activated
 *
 * In Node.js, you can set the `DEBUG=kuzzle-sdk` env variable.
 * In a browser, you can add the `?debugKuzzleSdk` in the URL
 * or set `window.debugKuzzleSdk` = true
 */
function debug (message, obj) {
  if (! shouldDebug()) {
    return ;
  }

  // eslint-disable-next-line no-console
  console.log(message);

  if (obj) {
    // Browser console can print directly objects
    const toPrint = typeof window === 'undefined' ? JSON.stringify(obj) : obj;

    // eslint-disable-next-line no-console
    console.log(toPrint);
  }
}

module.exports = { debug };