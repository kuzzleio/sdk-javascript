---
code: true
type: page
title: lrange
---

# lrange

Returns the list elements between the `start` and `stop` positions.

Offsets start at `0`, and the range is inclusive.

[[_Redis documentation_]](https://redis.io/commands/lrange)

## Arguments

```js
lrange(key, start, stop, [options]);
```

<br/>

| Arguments | Type               | Description                |
| --------- | ------------------ | -------------------------- |
| `key`     | <pre>string</pre>  | List key                   |
| `start`   | <pre>integer</pre> | Starting index (inclusive) |
| `stop`    | <pre>integer</pre> | Ending index (inclusive)   |
| `options` | <pre>object</pre>  | Optional query arguments   |

The `start` and `stop` arguments can be negative. In that case, the offset is calculated from the end of the list, going backward. For instance, -3 is the third element from the end of the list.

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to an array of list elements.

## Usage

<<< ./snippets/lrange.js
