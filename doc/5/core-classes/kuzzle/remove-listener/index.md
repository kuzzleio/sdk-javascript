---
code: false
type: page
title: removeListener
description: Kuzzle:removeListener
---

# removeListener

Remove a listener from an event.

---

## removeListener(event, callback)

| Arguments  | Type            | Description                                                                       |
| ---------- | --------------- | --------------------------------------------------------------------------------- |
| `event`    | string          | One of the events described in the `Event Handling` section of this documentation |
| `callback` | function/object | the callback                                                                      |

---

## Return Value

Returns the `Kuzzle` object to allow chaining.

## Usage

<<< ./snippets/remove-listener-1.js
