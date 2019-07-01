---
code: true
type: page
title: geoadd
---

# geoadd

Adds geospatial points to the specified key.

[[_Redis documentation_]](https://redis.io/commands/geoadd)

## Arguments

```js
geoadd(key, geopoints, [options]);
```

<br/>

| Arguments   | Type                | Description              |
| ----------- | ------------------- | ------------------------ |
| `key`       | <pre>string</pre>   | Key                      |
| `geopoints` | <pre>object[]</pre> | List of geopoints to add |
| `options`   | <pre>object</pre>   | Optional query arguments |

### geopoints

List of objects, each one of those being a geopoint to be added, with the following properties:

| Properties | Type              | Description                               |
| ---------- | ----------------- | ----------------------------------------- |
| `lat`      | <pre>number</pre> | Latitude                                  |
| `lon`      | <pre>number</pre> | Longitude                                 |
| `name`     | <pre>string</pre> | Unique point name (used as an identifier) |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of points added.

## Usage

<<< ./snippets/geoadd.js
