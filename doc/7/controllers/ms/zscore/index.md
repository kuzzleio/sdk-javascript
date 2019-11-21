---
code: true
type: page
title: zscore
---

# zscore

Returns the score of an element in a sorted set.

[[_Redis documentation_]](https://redis.io/commands/zscore)

## Arguments

```js
zscore(key, member, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Sorted set key           |
| `member`  | <pre>string</pre> | Member value             |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the member's score.

## Usage

<<< ./snippets/zscore.js
