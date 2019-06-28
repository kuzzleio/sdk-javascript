---
code: true
type: page
title: zincrby
---

# zincrby

Increments the score of a sorted set member by the provided value.

[[_Redis documentation_]](https://redis.io/commands/zincrby)

## Arguments

```js
zincrby(key, member, increment, [options]);
```

<br/>

| Arguments   | Type               | Description                              |
| ----------- | ------------------ | ---------------------------------------- |
| `key`       | <pre>string</pre>  | Sorted set key                           |
| `member`    | <pre>string</pre>  | Member value                             |
| `increment` | <pre>integer</pre> | Increment to apply to the member's score |
| `options`   | <pre>object</pre>  | Optional query arguments                 |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the updated member's score.

## Usage

<<< ./snippets/zincrby.js
