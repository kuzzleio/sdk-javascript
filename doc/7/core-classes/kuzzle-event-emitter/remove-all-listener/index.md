---
code: true
type: page
title: removeAllListeners
description: Removes all listener functions, or all listener functions from an event
---

# removeAllListeners

Removes all listener functions from an event.  
If no eventName is specified, removes all listener functions from all events.

## Arguments

```js
removeAllListeners([eventName]);
```

<br/>

| Argument    | Type              | Description                |
| ----------- | ----------------- | -------------------------- |
| `eventName` | <pre>string</pre> | Optional name of the event |

## Return

The `KuzzleEventEmitter` instance.

## Usage

<<< ./snippets/remove-all-listeners.js
