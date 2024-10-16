---
code: true
type: page
title: zrangebylex
---

# zrangebylex

Returns elements within a provided interval, in a sorted set where all members have equal score, using lexicographical ordering.

[[_Redis documentation_]](https://redis.io/commands/zrangebylex)

## Arguments

```js
zrangebylex(key, min, max, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Sorted set key           |
| `min`     | <pre>string</pre> | Minimum range value      |
| `max`     | <pre>string</pre> | Maximum range value      |
| `options` | <pre>object</pre> | Optional query arguments |

By default, the provided min and max values are inclusive. This behavior can be changed using the syntax described in the Redis [ZRANGEBYLEX](https://redis.io/commands/zrangebylex#how-to-specify-intervals) documentation.

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                                                                                                       |
| ---------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`    | <pre>integer[2]</pre>     | An array of 2 integers, used to limit the number of returned matching elements (similar to _SELECT LIMIT offset, count_ in SQL).<br/>Format: `[<offset>,<count>]` |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again                                                                                      |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |


## Resolve

Resolves to an array of matched elements.

## Usage

<<< ./snippets/zrangebylex.js
