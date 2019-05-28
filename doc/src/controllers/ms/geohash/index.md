---
code: true
type: page
title: geohash
---

# geohash

Converts a key's geopoints (see [geoadd](/sdk/js/6/controllers/ms/geoadd)) into [geohashes](https://en.wikipedia.org/wiki/Geohash).

[[_Redis documentation_]](https://redis.io/commands/geohash)

## Arguments

```js
geohash(key, geopoints, [options]);
```

<br/>

| Arguments   | Type                | Description                  |
| ----------- | ------------------- | ---------------------------- |
| `key`       | <pre>string</pre>   | Key                          |
| `geopoints` | <pre>string[]</pre> | List of geopoints to convert |
| `options`   | <pre>object</pre>   | Optional query arguments     |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to an array of converted geohashes, in the same order than the one provided in the query.

## Usage

<<< ./snippets/geohash.js
