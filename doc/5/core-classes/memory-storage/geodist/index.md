---
code: false
type: page
title: geodist
description: MemoryStorage:geodist
---

# geodist

Returns the distance between two geospatial members of a key (see [geoadd](/sdk/js/5/core-classes/memory-storage/geoadd)).
The returned distance is expressed in meters by default.

[[_Redis documentation_]](https://redis.io/commands/geodist)

---

## geodist(key, member1, member2, [options], callback)

| Arguments  | Type        | Description                         |
| ---------- | ----------- | ----------------------------------- |
| `key`      | string      | Key identifier                      |
| `member1`  | string      | Name of the first geospatial point  |
| `member2`  | string      | Name of the second geospatial point |
| `options`  | JSON Object | Optional parameters                 |
| `callback` | function    | Callback                            |

---

## Options

| Option     | Type    | Description                                              | Default |
| ---------- | ------- | -------------------------------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not                        | `true`  |
| `unit`     | string  | Distance unit.<br/>Allowed values: `m`, `km`, `mi`, `ft` | `m`     |

---

## Callback Response

Returns the calculated distance between the two provided geospatial points.

## Usage

<<< ./snippets/geodist-1.js

> Callback response:

```json
166274.1516
```
