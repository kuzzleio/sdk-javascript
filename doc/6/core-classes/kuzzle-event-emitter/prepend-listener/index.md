---
code: true
type: page
title: prependListener
description: Prepends a new listener for an event
---

# prependListener

Adds a listener function to the beginning of the listeners array for an event.

## Arguments

```js
prependListener(eventName, callback);
```

<br/>

| Argument    | Type                | Description                                        |
| ----------- | ------------------- | -------------------------------------------------- |
| `eventName` | <pre>string</pre>   | The name of the event                              |
| `callback`  | <pre>function</pre> | Function to call every time the event is triggered |

## Return

The `KuzzleEventEmitter` instance.

## Usage

<<< ./snippets/prepend-listener.js
