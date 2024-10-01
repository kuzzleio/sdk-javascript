---
code: true
type: page
title: geohash
---

# geohash

Converts a key's geopoints (see [geoadd](/sdk/js/7/controllers/ms/geoadd)) into [geohashes](https://en.wikipedia.org/wiki/Geohash).

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
| `queuable` | <pre>boolean</pre> (`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to an array of converted geohashes, in the same order than the one provided in the query.

## Usage

<<< ./snippets/geohash.js
