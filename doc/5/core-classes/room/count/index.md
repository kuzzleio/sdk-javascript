---
code: false
type: page
title: count
description: Room:count
---

# count

Returns the number of subscribers in the room.

---

## count(callback)

| Arguments  | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| `callback` | function | Callback handling the response |

---

## Callback Response

Returns an `integer` containing the number of users subscribing to this room.

## Usage

<<< ./snippets/count-1.js

> Callback response

```json
1
```
