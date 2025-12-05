"use strict";

/**
 * Ensure a global XMLHttpRequest binding exists so strict-mode tests can
 * reassign it without throwing ReferenceError in Node.
 */
if (typeof global.XMLHttpRequest === "undefined") {
  global.XMLHttpRequest = undefined;
}
