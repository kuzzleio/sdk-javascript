---
code: true
type: page
title: bitpos
---

# bitpos

Returns the position of the first bit set to 1 or 0 in a string, or in a substring.

[[_Redis documentation_]](https://redis.io/commands/bitpos)

## Arguments

```js
bitpos(key, bit, [options]);
```

<br/>

| Arguments | Type               | Description                                    |
| --------- | ------------------ | ---------------------------------------------- |
| `key`     | <pre>string</pre>  | Key                                            |
| `bit`     | <pre>integer</pre> | Bit to look for.<br/>Accepted values: `0`, `1` |
| `options` | <pre>object</pre>  | Optional query arguments                       |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `end`      | <pre>integer</pre>        | Search ends at the provided offset                                           |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `start`    | <pre>integer</pre>        | Search starts at the provided offset                                         |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to the position of the first bit found matching the searched value.

## Usage

<<< ./snippets/bitpos.js
