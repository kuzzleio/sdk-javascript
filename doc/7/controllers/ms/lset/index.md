---
code: true
type: page
title: lset
---

# lset

Sets the list element at `index` with the provided value.

[[_Redis documentation_]](https://redis.io/commands/lset)

## Arguments

```js
lset(key, index, value, [options]);
```

<br/>

| Arguments | Type               | Description                                                                                     |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `key`     | <pre>string</pre>  | List key                                                                                        |
| `index`   | <pre>integer</pre> | Index of the list (lists are 0-indexed). If negative, it goes backward from the end of the list |
| `value`   | <pre>string</pre>  | Value to set                                                                                    |
| `options` | <pre>object</pre>  | Optional query arguments                                                                        |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves once the new value is set.

## Usage

<<< ./snippets/lset.js
