---
code: true
type: page
title: addListener
description: Adds a new listener for an event
---

# addListener

Adds a listener function to the end of the listeners array for an event.  
Whenever an event is triggered, listener functions are called in the order they were registered.

## Arguments

```js
addListener (eventName, callback);
```

<br/>

| Argument   | Type     | Description      |
| ---------- | -------- | -------- |
| `eventName`    | <pre>string</pre> | The name of the event |
| `callback` | <pre>function</pre> | Function to call every time the event is triggered     |

## Return

The `KuzzleEventEmitter` instance.

## Usage

<<< ./snippets/add-listener.js
