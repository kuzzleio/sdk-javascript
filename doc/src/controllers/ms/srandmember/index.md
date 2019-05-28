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
| `key`     | `string` | Set key                  |
| `options` | `object` | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)   | Description                                                                                                                                                                         |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `count`    | `integer (1)`    | If positive, returns `count` elements at random from the set, without repetition.<br/>If negative, returns `abs(count)` elements, and the same element can be chosen multiple times |
| `queuable` | `boolean (true)` | If true, queues the request during downtime, until connected to Kuzzle again                                                                                                        |

## Resolve

## Usage

<<< ./snippets/srandmember.js
