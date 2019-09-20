---
code: true
type: page
title: hsetnx
---

# hsetnx

Sets a field and its value in a hash, only if the field does not already exist.

[[_Redis documentation_]](https://redis.io/commands/hsetnx)

## Arguments

```js
hsetnx(key, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Key                      |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

## Usage

<<< ./snippets/hsetnx.js
