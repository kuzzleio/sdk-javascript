"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrowser = exports.getBrowserWindow = void 0;
function getBrowserWindow() {
    let windowObject;
    try {
        windowObject || (windowObject = globalThis.window);
        if (windowObject) {
            return windowObject;
        }
    }
    catch {
        // Check next variable
    }
    try {
        windowObject || (windowObject = global.window);
        if (windowObject) {
            return windowObject;
        }
    }
    catch {
        // Check next variable
    }
    try {
        windowObject || (windowObject = window);
        if (windowObject) {
            return windowObject;
        }
    }
    catch {
        // return undefined
    }
}
exports.getBrowserWindow = getBrowserWindow;
function isBrowser() {
    const window = getBrowserWindow();
    return window !== undefined && window !== null && typeof window === "object";
}
exports.isBrowser = isBrowser;
//# sourceMappingURL=browser.js.map