let windowObject: Window | undefined;

let cachedWindowObject = false;

export function getBrowserWindow(): Window | undefined {
  if (cachedWindowObject) {
    return windowObject;
  }

  try {
    windowObject ||= globalThis.window;
  } catch {
    // do nothing
  }

  try {
    windowObject ||= global.window;
  } catch {
    // do nothing
  }

  try {
    windowObject ||= window;
  } catch {
    // do nothing
  }

  cachedWindowObject = true;
  return windowObject;
}

export function isBrowser(): boolean {
  const window = getBrowserWindow();

  return window !== undefined && window !== null && typeof window === "object";
}
