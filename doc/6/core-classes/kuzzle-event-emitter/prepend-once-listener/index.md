---
code: true
type: page
title: prependOnceListener
description: Prepends a new once listener for an event
---

# prependOnceListener

Adds a **one-time** listener function for an event to the beginning of the listeners array.  
The next time that event is triggered, this listener is removed, and then invoked.

## Arguments

```js
prependOnceListener(eventName, callback);
```

<br/>

| Argument    | Type                | Description                                  |
| ----------- | ------------------- | -------------------------------------------- |
| `eventName` | <pre>string</pre>   | The name of the event                        |
| `callback`  | <pre>function</pre> | Function to call when the event is triggered |

## Return

The `KuzzleEventEmitter` instance.

## Usage

<<< ./snippets/prepend-once-listener.js
