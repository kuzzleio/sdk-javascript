---
code: true
type: page
title: geodist
---

# geodist

Returns the distance between two geospatial members of a key (see [geoadd](/sdk/js/7/controllers/ms/geoadd)).

The returned distance is expressed in meters by default.

[[_Redis documentation_]](https://redis.io/commands/geodist)

## Arguments

```js
geodist(key, geopoint1, geopoint2, [options]);
```

<br/>

| Arguments   | Type              | Description                |
| ----------- | ----------------- | -------------------------- |
| `key`       | <pre>string</pre> | Key                        |
| `geopoint1` | <pre>string</pre> | First geopoint identifier  |
| `geopoint2` | <pre>string</pre> | Second geopoint identifier |
| `options`   | <pre>object</pre> | Optional query arguments   |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                                    |
| ---------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again                   |
| `unit`     | <pre>string ('m')</pre>   | The unit used for the returned calculated distance.<br/>Accepted values: `m`, `km`, `mi`, `ft` |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to the calculated distance.

## Usage

<<< ./snippets/geodist.js
