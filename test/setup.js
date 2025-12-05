"use strict";

/**
 * Ensure global bindings exist so strict-mode tests can reassign them
 * without throwing ReferenceError in Node.
 */
if (typeof global.XMLHttpRequest === "undefined") {
  global.XMLHttpRequest = undefined;
}

// Define a writable global binding for WebSocket when Node does not provide one
if (typeof global.WebSocket === "undefined") {
  global.WebSocket = undefined;
}
