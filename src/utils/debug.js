function shouldDebug () {
  if (typeof window === 'undefined') {
    const debugString = process.env.DEBUG || '';

    return debugString.includes('kuzzle-sdk');
  }

  const url = new URL(window.location);

  return url.searchParams.get('debugKuzzleSdk') !== null;
}

/**
 * Print debug only if activated
 *
 * In Node.js, you can set the `DEBUG=kuzzle-sdk` env variable
 * In a browser, you can add the `?debugKuzzleSdk` in the URL
 */
function debug (message, obj) {
  if (! shouldDebug()) {
    return ;
  }

  // eslint-disable-next-line no-console
  console.log(message);

  if (obj) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(obj));
  }
}

module.exports = { debug };