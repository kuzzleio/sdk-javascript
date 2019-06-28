---
code: true
type: page
title: hset
---

# hset

Sets a field and its value in a hash.

If the key does not exist, a new key holding a hash is created.

If the field already exists, its value is overwritten.

[[_Redis documentation_]](https://redis.io/commands/hset)

## Arguments

```js
hset(key, field, value, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Hash key                 |
| `field`   | <pre>string</pre> | Field name               |
| `value`   | <pre>string</pre> | Field value              |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves once the field has been set.

## Usage

<<< ./snippets/hset.js
