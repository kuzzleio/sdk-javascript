---
code: false
type: page
title: Debugging
description: How to debug the SDK in your application
order: 600
---

# Debugging

The SDK internal behavior can be observed for debugging purposes.

## Events listening

The SDK emits internal events, the complete list is available here: [Events](/sdk/js/7/essentials/events).

You can listen to every event and print payload contents with the following snippet:

```js
for (const event of kuzzle.events) {
  kuzzle.on(event, (...args) =>  console.log(event, ...args));
}
```

## Print Request and Response

<SinceBadge version="7.8.3"/>

You can print every request sent to Kuzzle and every response sent back to the SDK by activating the debug mode.

In Node.js, the `DEBUG` environment variable should contain the `kuzzle-sdk` string.

```bash
export DEBUG=kuzzle-sdk

# Run your program
```

In the Browser, you can:
 - add the `debugKuzzleSdk` search param in the URL. (e.g. `http://my-application.by/<path>?debugKuzzleSdk`)
 - set the `window.debugKuzzleSdk` variable to `true`
