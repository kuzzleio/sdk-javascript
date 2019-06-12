---
code: false
type: page
title: pfmerge
description: MemoryStorage:pfmerge
---

# pfmerge

Merges multiple [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) data structures into an unique HyperLogLog structure stored at `key`, approximating the cardinality of the union of the source structures.

[[_Redis documentation_]](https://redis.io/commands/pfmerge)

---

## pfmerge(key, sources, [options], callback)

| Arguments  | Type        | Description                                |
| ---------- | ----------- | ------------------------------------------ |
| `key`      | string      | Destination key identifier                 |
| `sources`  | string      | List of HyperLogLog source key identifiers |
| `options`  | JSON Object | Optional parameters                        |
| `callback` | function    | Callback                                   |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns null if successful.

## Usage

<<< ./snippets/pfmerge-1.js
