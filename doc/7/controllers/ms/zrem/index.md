---
code: true
type: page
title: zrem
---

# zrem

Removes members from a sorted set.

[[_Redis documentation_]](https://redis.io/commands/zrem)

## Arguments

```js
zrem(key, members, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `key`     | <pre>string</pre>   | Sorted set key           |
| `members` | <pre>string[]</pre> | Member values to remove  |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of removed members.

## Usage

<<< ./snippets/zrem.js
