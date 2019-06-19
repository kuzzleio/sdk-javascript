---
code: false
type: page
title: geohash
description: MemoryStorage:geohash
---

# geohash

Returns a valid [geohash](https://en.wikipedia.org/wiki/Geohash) for the provided key's members (see [geoadd](/sdk/js/5/core-classes/memory-storage/geoadd)).

[[_Redis documentation_]](https://redis.io/commands/geohash)

---

## geohash(key, members, [options], callback)

| Arguments  | Type        | Description                                    |
| ---------- | ----------- | ---------------------------------------------- |
| `key`      | string      | Key identifier                                 |
| `members`  | array       | List of geospatial points contained in the key |
| `options`  | JSON Object | Optional parameters                            |
| `callback` | function    | Callback                                       |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an array of geohashes, in the same order than the provided members list.

## Usage

<<< ./snippets/geohash-1.js

> Callback response:

```json
["sqc8b49rny0", "sqdtr74hyu0"]
```
