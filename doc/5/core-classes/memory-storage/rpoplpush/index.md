---
code: false
type: page
title: rpoplpush
description: MemoryStorage:rpoplpush
---

# rpoplpush

Removes the last element of the list at `source` and pushes it back at the start of the list at `destination`.

[[_Redis documentation_]](https://redis.io/commands/rpoplpush)

---

## rpoplpush(source, destination, [options], [callback])

| Arguments     | Type        | Description                |
| ------------- | ----------- | -------------------------- |
| `source`      | string      | Source key identifier      |
| `destination` | string      | Destination key identifier |
| `options`     | JSON Object | Optional parameters        |
| `callback`    | function    | Callback                   |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns the value of the removed and pushed item.

## Usage

<<< ./snippets/rpoplpush-1.js

> Callback response:

```json
"foo"
```
