---
code: true
type: page
title: hlen
---

# hlen

Returns the number of fields contained in a hash.

[[_Redis documentation_]](https://redis.io/commands/hlen)

## Arguments

```js
hlen(key, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Hash key                 |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of fields stored in a hash.

## Usage

<<< ./snippets/hlen.js
