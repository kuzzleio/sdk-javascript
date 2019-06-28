---
code: true
type: page
title: hmget
---

# hmget

Returns the values of the specified hash's fields.

[[_Redis documentation_]](https://redis.io/commands/hmget)

## Arguments

```js
hmget(key, fields, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `key`     | <pre>string</pre>   | Hash key                 |
| `fields`  | <pre>string[]</pre> | Field names              |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the list of requested field values, in the same order than in the query.

## Usage

<<< ./snippets/hmget.js
