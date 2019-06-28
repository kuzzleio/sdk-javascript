---
code: true
type: page
title: lindex
---

# lindex

Returns the element at the provided index in a list.

[[_Redis documentation_]](https://redis.io/commands/lindex)

## Arguments

```js
lindex(key, index, [options]);
```

<br/>

| Arguments | Type               | Description              |
| --------- | ------------------ | ------------------------ |
| `key`     | <pre>string</pre>  | List key                 |
| `index`   | <pre>integer</pre> | List index               |
| `options` | <pre>object</pre>  | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the stored value at the provided list index.

## Usage

<<< ./snippets/lindex.js
