---
code: true
type: page
title: zunionstore
---

# zunionstore

Computes the union of the provided sorted sets, and stores the result in a new sorted set.

[[_Redis documentation_]](https://redis.io/commands/zunionstore)

## Arguments

```js
zunionstore(dest, sources, [options]);
```

<br/>

| Arguments | Type                | Description                     |
| --------- | ------------------- | ------------------------------- |
| `dest`    | <pre>string</pre>   | Target sorted set key           |
| `sources` | <pre>string[]</pre> | List of sorted set keys to join |
| `options` | <pre>object</pre>   | Optional query arguments        |

### options

The `options` arguments can contain the following option properties:

| Property    | Type (default)            | Description                                                                                                   |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `aggregate` | <pre>string ("sum")</pre> | Specifies how members' scores are aggregated during the intersection.<br/>Allowed values: `min`, `max`, `sum` |
| `queuable`  | <pre>boolean (`true`)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again                                  |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |
| `weights`   | <pre>integer[]</pre>      | List of multiplication factors to apply to sources sets, before aggregation.                                  |

## Resolve

Resolves to the number of members added to the destination sorted set.

## Usage

<<< ./snippets/zunionstore.js
