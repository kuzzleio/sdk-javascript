---
code: false
type: page
title: sunionstore
description: MemoryStorage:sunionstore
---

# sunionstore

Computes the union of the provided sets of unique values and stores the result in the `destination` key.

If the destination key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/sunionstore)

---

## sunionstore(destination, keys, [options], callback)

| Arguments     | Type        | Description                                |
| ------------- | ----------- | ------------------------------------------ |
| `destination` | string      | Destination key identifier                 |
| `keys`        | string      | List of sets of unique values to intersect |
| `options`     | JSON Object | Optional parameters                        |
| `callback`    | function    | Callback                                   |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an integer containing the number of elements in the stored union.

## Usage

<<< ./snippets/sunionstore-1.js

> Callback response:

```json
4
```
