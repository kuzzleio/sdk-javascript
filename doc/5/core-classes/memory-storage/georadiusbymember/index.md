---
code: false
type: page
title: georadiusbymember
description: MemoryStorage:georadiusbymember
---

# georadiusbymember

> Callback response, with the "withcoord" option:

```json
[
  { "name": "Palermo", "coordinates": [13.361389338970184, 38.1155563954963] },
  { "name": "Catania", "coordinates": [15.087267458438873, 37.50266842333162] }
]
```

> Callback response, with the "withdist" option:

```json
[
  { "name": "Palermo", "distance": 190.4424 },
  { "name": "Catania", "distance": 56.4413 }
]
```

Returns the members (added with [geoadd](/sdk/js/5/core-classes/memory-storage/geoadd)) of a given key inside the provided geospatial radius, centered around one of a key's member.
[[_Redis documentation_]](https://redis.io/commands/georadiusbymember)

---

## georadiusbymember(key, member, distance, unit, [options], callback)

| Arguments  | Type        | Description                                          |
| ---------- | ----------- | ---------------------------------------------------- |
| `key`      | string      | Key identifier                                       |
| `member`   | string      | Name of the point to use as the center of the radius |
| `distance` | double      | Maximum distance from the center                     |
| `unit`     | string      | Distance unit                                        |
| `options`  | JSON Object | Optional parameters                                  |
| `callback` | function    | Callback                                             |

---

## Options

| Option      | Type    | Description                                                                                                                  | Default |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- |
| `count`     | int     | Limit the result set to `count` members                                                                                      | `null`  |
| `queuable`  | boolean | Make this request queuable or not                                                                                            | `true`  |
| `sort`      | string  | Return items from the nearest to the farthest to the center (`ASC`) or vice versa (`DESC`)                                   | `null`  |
| `withcoord` | boolean | Also return the longitude and latitude coordinates of the matching items                                                     | `false` |
| `withdist`  | boolean | Also return the distance of the returned items from the specified center, in the same unit than the one provided with `unit` | `false` |

---

## Callback Response

Returns an array of names for points that are inside the provided radius.

## Usage

<<< ./snippets/georadiusbymember-1.js

> Callback response:

```json
[{ "name": "Palermo" }, { "name": "Catania" }]
```
