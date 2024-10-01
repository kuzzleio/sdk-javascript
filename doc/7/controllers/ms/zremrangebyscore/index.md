---
code: true
type: page
title: zremrangebyscore
---

# zremrangebyscore

Removes members from a sorted set, with a score between the provided interval.

[[_Redis documentation_]](https://redis.io/commands/zremrangebylex)

## Arguments

```js
zremrangebyscore(key, min, max, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Sorted set key           |
| `min`     | <pre>string</pre> | Minimum score value      |
| `max`     | <pre>string</pre> | Maximum score value      |
| `options` | <pre>object</pre> | Optional query arguments |

By default, `min` and `max` are inclusive. Check the full Redis documentation for other options.

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to the number of removed elements.

## Usage

<<< ./snippets/zremrangebyscore.js
