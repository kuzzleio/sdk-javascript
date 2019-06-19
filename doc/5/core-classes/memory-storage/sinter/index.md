---
code: false
type: page
title: sinter
description: MemoryStorage:sinter
---

# sinter

Returns the intersection of the provided sets of unique values.

[[_Redis documentation_]](https://redis.io/commands/sinter)

---

## sinter(keys, [options], callback)

| Arguments  | Type        | Description                                |
| ---------- | ----------- | ------------------------------------------ |
| `keys`     | string      | List of sets of unique values to intersect |
| `options`  | JSON Object | Optional parameters                        |
| `callback` | function    | Callback                                   |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an array of values in the computed intersection.

## Usage

<<< ./snippets/sinter-1.js

> Callback response:

```json
["intersection value1", "intersection value2", "..."]
```
