---
code: true
type: page
title: addListener
description: Add a listener to an event
---

# addListener

Adds a listener function to the end of the listeners array for an event.
Whenever an event is triggered, listener functions are called in the order they were registered.

## Arguments

```javascript
addListener(event, callback);
```

<br/>

| Argument   | Type                | Description                                                                                |
| ---------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `event`    | <pre>string</pre>   | One of the event described in the [Events](/sdk/js/6/events) section of this documentation |
| `callback` | <pre>function</pre> | The function to call every time the event is triggered                                     |

## Return

The `Kuzzle` instance.

## Usage

<<< ./snippets/add-listener.js
