export function getBrowserWindow() {
  let windowObject;
  
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

  return windowObject;
}

export function isBrowser() {
  const window = getBrowserWindow()

  return window !== undefined
  && typeof window === 'object';
}