---
code: true
type: page
title: smove
---

# smove

Moves a member from a set of unique values to another.

[[_Redis documentation_]](https://redis.io/commands/smove)

## Arguments

```js
smove(src, dest, member, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `src`     | <pre>string</pre> | Source set key           |
| `dest`    | <pre>string</pre> | Destination set key      |
| `member`  | <pre>string</pre> | Member to move           |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to a boolean telling whether the operation succeeded or not.

## Usage

<<< ./snippets/smove.js
