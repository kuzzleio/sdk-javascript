---
code: true
type: page
title: psetex
---

# psetex

Sets a key with the provided value, and an expiration delay expressed in milliseconds. If the key does not exist, it is created beforehand.

[[_Redis documentation_]](https://redis.io/commands/psetex)

## Arguments

```js
psetex(key, value, milliseconds, [options]);
```

<br/>

| Arguments      | Type               | Description                                           |
| -------------- | ------------------ | ----------------------------------------------------- |
| `key`          | <pre>string</pre>  | Key                                                   |
| `value`        | <pre>string</pre>  | Value                                                 |
| `milliseconds` | <pre>integer</pre> | Number of milliseconds after which the key is deleted |
| `options`      | <pre>object</pre>  | Optional query arguments                              |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves once the operation succeeds.

## Usage

<<< ./snippets/psetex.js
