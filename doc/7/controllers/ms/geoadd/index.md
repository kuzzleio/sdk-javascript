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
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to the number of points added.

## Usage

<<< ./snippets/geoadd.js
