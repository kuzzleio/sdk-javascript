---
code: false
type: page
title: georadius
description: MemoryStorage:georadius
---

# georadius

> Callback response, with no option provided:

```json
[{ "name": "Palermo" }, { "name": "Catania" }]
```

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

Returns the members (added with [geoadd](/sdk/js/5/core-classes/memory-storage/geoadd)) of a given key inside the provided geospatial radius.

[[_Redis documentation_]](https://redis.io/commands/georadius)

---

## georadius(key, longitude, latitude, distance, unit, [options], callback)

| Arguments   | Type        | Description                           |
| ----------- | ----------- | ------------------------------------- |
| `key`       | string      | Key identifier                        |
| `longitude` | double      | Longitude of the center of the radius |
| `latitude`  | double      | Latitude of the center of the radius  |
| `distance`  | double      | Maximum distance from the center      |
| `unit`      | string      | Distance unit                         |
| `options`   | JSON Object | Optional parameters                   |
| `callback`  | function    | Callback                              |

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

<<< ./snippets/georadius-1.js
