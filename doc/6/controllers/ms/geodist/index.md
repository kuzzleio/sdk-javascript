---
code: true
type: page
title: geodist
---

# geodist

Returns the distance between two geospatial members of a key (see [geoadd](/sdk/js/6/controllers/ms/geoadd)).

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
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again                   |
| `unit`     | <pre>string ('m')</pre>   | The unit used for the returned calculated distance.<br/>Accepted values: `m`, `km`, `mi`, `ft` |

## Resolve

Resolves to the calculated distance.

## Usage

<<< ./snippets/geodist.js
