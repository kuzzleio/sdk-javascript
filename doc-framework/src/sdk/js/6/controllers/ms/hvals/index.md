---
code: true
type: page
title: hvals
---

# hvals

Returns all values contained in a hash.

[[_Redis documentation_]](https://redis.io/commands/hvals)

## Arguments

```js
hvals(key, [options]);
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

Resolves to the list of hash's field values.

## Usage

<<< ./snippets/hvals.js
