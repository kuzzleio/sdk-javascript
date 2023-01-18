export function getBrowserWindow(): Window | undefined {
  let windowObject: Window | undefined;

  try {
    windowObject ||= globalThis.window;
    if (windowObject) {
      return windowObject;
    }
  } catch {
    // Check next variable
  }

  try {
    windowObject ||= global.window;
    if (windowObject) {
      return windowObject;
    }
  } catch {
    // Check next variable
  }

  try {
    windowObject ||= window;
    if (windowObject) {
      return windowObject;
    }
  } catch {
    // return undefined
  }
}

export function isBrowser(): boolean {
  const window = getBrowserWindow();

  return window !== undefined && window !== null && typeof window === "object";
}
