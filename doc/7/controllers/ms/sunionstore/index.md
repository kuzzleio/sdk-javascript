---
code: true
type: page
title: sunionstore
---

# sunionstore

Computes the union of multiple sets of unique values and stores it in a new set.

If the destination key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/sunionstore)

## Arguments

```js
sunionstore(dest, sources, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `key`     | <pre>string</pre>   | Union target key         |
| `sources` | <pre>string[]</pre> | List of set keys         |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to the number of values added to the destination key.

## Usage

<<< ./snippets/sunionstore.js
