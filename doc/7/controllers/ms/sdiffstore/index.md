---
code: true
type: page
title: sdiffstore
---

# sdiffstore

Computes the difference between a reference set of unique values, and other sets. The differences are then stored in the provided destination key.

If the destination key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/sdiffstore)

## Arguments

```js
sdiffstore(ref, sets, dest, [options]);
```

<br/>

| Arguments | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| `ref`     | <pre>string</pre>   | Set key of reference                     |
| `sets`    | <pre>string[]</pre> | List of sets to compare to the reference |
| `dest`    | <pre>string</pre>   | Destination key                          |
| `options` | <pre>object</pre>   | Optional query arguments                 |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to the number of values stored at the new key.

## Usage

<<< ./snippets/sdiffstore.js
