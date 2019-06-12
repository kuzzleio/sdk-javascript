---
code: false
type: page
title: geoadd
description: MemoryStorage:geoadd
---

# geoadd

Adds geospatial points to the specified key.

[[_Redis documentation_]](https://redis.io/commands/geoadd)

---

## geoadd(key, points, [options], [callback])

| Arguments  | Type             | Description                                                                                                                                                                                                    |
| ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`      | string           | Destination key identifier                                                                                                                                                                                     |
| `points`   | array of objects | List of geospatial points to add. Each point is described by a JSON object containing the following properties:<br/>`lon` (longitude, `float`), `lat` (latitude, `float`), `name` (point identifier, `string`) |
| `options`  | JSON Object      | Optional parameters                                                                                                                                                                                            |
| `callback` | function         | Callback                                                                                                                                                                                                       |

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

Returns an integer containing the number of points added to the key.

## Usage

<<< ./snippets/geoadd-1.js

> Callback response:

```json
2
```
