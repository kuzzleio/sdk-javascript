---
code: true
type: page
title: georadiusbymember
---

# georadiusbymember

Returns the members (added with [geoadd](/sdk/js/6/controllers/ms/geoadd)) of a given key inside the provided geospatial radius, centered around one of a key's member.

[[_Redis documentation_]](https://redis.io/commands/georadiusbymember)

## Arguments

```js
georadiusbymember(key, geopoint, dist, unit, [options]);
```

<br/>

| Arguments  | Type              | Description                                                                     |
| ---------- | ----------------- | ------------------------------------------------------------------------------- |
| `key`      | <pre>string</pre> | Key                                                                             |
| `geopoint` | <pre>string</pre> | Name of the geopoint to use as the center                                       |
| `dist`     | <pre>number</pre> | Distance from the center                                                        |
| `unit`     | <pre>string</pre> | Unit of the distance parameter value.<br/>Allowed values: `m`, `km`, `mi`, `ft` |
| `options`  | <pre>object</pre> | Optional query arguments                                                        |

### options

The `options` arguments can contain the following option properties:

| Property    | Type (default)             | Description                                                                            |
| ----------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `count`     | <pre>integer</pre>         | Limit the number of returned geopoints to the provided value                           |
| `queuable`  | <pre>boolean (true)</pre>  | If true, queues the request during downtime, until connected to Kuzzle again           |
| `sort`      | <pre>string</pre>          | Sort the result by distance, relative to the center.<br/>Allowed values: `ASC`, `DESC` |
| `withcoord` | <pre>boolean (false)</pre> | Include the position of the matched geopoint in the result                             |
| `withdist`  | <pre>boolean (false)</pre> | Include the calculated distance from the matched geopoint to center                    |

## Resolve

Resolves to an array of matched geopoints.

Each returned geopoint is an object with the following properties:

| Property      | Type                | Description                                                                                                 |
| ------------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `name`        | <pre>string</pre>   | Geopoint identifier                                                                                         |
| `coordinates` | <pre>number[]</pre> | Geopoint coordinates in the following format: `[lon, lat]`. Only available if the option `withcoord` is set |
| `distance`    | <pre>number</pre>   | Distance from the center. Only available if the option `withdist` is set                                    |

## Usage

<<< ./snippets/georadiusbymember.js
