"use strict";

/**
 * Ensure global bindings exist so strict-mode tests can reassign them
 * without throwing ReferenceError in Node.
 */
if (typeof global.XMLHttpRequest === "undefined") {
  global.XMLHttpRequest = undefined;
}

// Define a writable global binding for WebSocket when Node does not provide one
if (typeof WebSocket === "undefined") {
  /* eslint-disable no-var */
  // eslint-disable-next-line vars-on-top
  var WebSocket = undefined; // creates the global binding
  /* eslint-enable no-var */
}
