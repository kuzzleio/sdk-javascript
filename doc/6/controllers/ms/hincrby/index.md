---
code: true
type: page
title: hincrby
---

# hincrby

Increments the number stored in a hash field by the provided integer value.

[[_Redis documentation_]](https://redis.io/commands/hincrby)

## Arguments

```js
hincrby(key, field, increment, [options]);
```

<br/>

| Arguments   | Type               | Description              |
| ----------- | ------------------ | ------------------------ |
| `key`       | <pre>string</pre>  | Hash key                 |
| `field`     | <pre>string</pre>  | Field name               |
| `increment` | <pre>integer</pre> | Increment value          |
| `options`   | <pre>object</pre>  | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the updated value of the hash's field.

## Usage

<<< ./snippets/hincrby.js
