---
code: true
type: page
title: zrevrange
---

# zrevrange

Identical to [zrange](/sdk/js/7/controllers/ms/zrange), except that the sorted set is traversed in descending order.

[[_Redis documentation_]](https://redis.io/commands/zrevrange)

## Arguments

```js
zrevrange(key, start, stop, [options]);
```

<br/>

| Arguments | Type               | Description                       |
| --------- | ------------------ | --------------------------------- |
| `key`     | <pre>string</pre>  | Sorted set key                    |
| `start`   | <pre>integer</pre> | Starting index offset (inclusive) |
| `stop`    | <pre>integer</pre> | Ending index offset (inclusive)   |
| `options` | <pre>object</pre>  | Optional query arguments          |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to a list of element objects.

## Usage

<<< ./snippets/zrevrange.js
