---
code: false
type: page
title: addListener
description: Kuzzle:addListener
---

# addListener

Adds a listener to an event. When an event is fired, listeners are called in the order that they are added.

---

## addListener(event, listener)

| Arguments  | Type     | Description                                                                      |
| ---------- | -------- | -------------------------------------------------------------------------------- |
| `event`    | string   | One of the event described in the `Event Handling` section of this documentation |
| `listener` | function | The function to call each time one of the registered event is fired              |

---

## Return Value

Returns the `Kuzzle` object to allow chaining.

## Usage

<<< ./snippets/add-listener-1.js
