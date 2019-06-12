---
code: false
type: page
title: sinterstore
description: MemoryStorage:sinterstore
---

# sinterstore

Computes the intersection of the provided sets of unique values and stores the result in the `destination` key.

If the destination key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/sinterstore)

---

## sinterstore(destination, keys, [options], callback)

| Arguments     | Type        | Description                                |
| ------------- | ----------- | ------------------------------------------ |
| `destination` | string      | Destination key identifier                 |
| `keys`        | array       | List of sets of unique values to intersect |
| `options`     | JSON Object | Optional parameters                        |
| `callback`    | function    | Callback                                   |

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

Returns an integer containing the number of elements in the stored intersection.

## Usage

<<< ./snippets/sinterstore-1.js

> Callback response:

```json
4
```
