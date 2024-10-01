---
code: true
type: page
title: srandmember
---

# srandmember

Returns one or more members of a set of unique values, at random.

[[_Redis documentation_]](https://redis.io/commands/srandmember)

## Arguments

```js
srandmember(key, [options]);
```

<br/>

| Arguments | Type     | Description              |
| --------- | -------- | ------------------------ |
| `key`     | <pre>string</pre> | Set key                  |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)   | Description                                                                                                                                                                         |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `count`    | `integer (1)`    | If positive, returns `count` elements at random from the set, without repetition.<br/>If negative, returns `abs(count)` elements, and the same element can be chosen multiple times |
| `queuable` | `boolean (true)` | If `true`, queues the request during downtime, until connected to Kuzzle again                                                                                                        |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

## Usage

<<< ./snippets/srandmember.js
