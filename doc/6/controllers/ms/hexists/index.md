---
code: true
type: page
title: hexists
---

# hexists

Checks if a field exists in a hash.

[[_Redis documentation_]](https://redis.io/commands/hexists)

## Arguments

```js
hexists(key, field, [options]);
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

Resolves to a boolean telling whether the checked field exists or not.

## Usage

<<< ./snippets/hexists.js
