---
code: true
type: page
title: hget
---

# hget

Returns the field's value of a hash.

[[_Redis documentation_]](https://redis.io/commands/hget)

## Arguments

```js
hget(key, field, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Hash key                 |
| `field`   | <pre>string</pre> | Field name               |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Returns the field's value.

## Usage

<<< ./snippets/hget.js
