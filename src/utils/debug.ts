import { getBrowserWindow, isBrowser } from "./browser";

let NODE_DEBUG: boolean | undefined;

function shouldDebug(): boolean {
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
      if (NODE_DEBUG === undefined) {
        NODE_DEBUG = (process.env.DEBUG ?? "").includes("kuzzle-sdk");
      }

      return NODE_DEBUG;
    }

    const window = getBrowserWindow() as
      | (Window & {
          debugKuzzleSdk?: boolean;
        })
      | null;

    if (!window) {
      return false;
    }

    if (window.debugKuzzleSdk) {
      return true;
    }

    const location = window.location;

    if (!location) {
      return false;
    }

    const href =
      typeof location === "string"
        ? location
        : ((location as Location).href ?? String(location));

    return new URL(href).searchParams.get("debugKuzzleSdk") !== null;
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
export function debug(message: string, obj?: unknown): void {
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
