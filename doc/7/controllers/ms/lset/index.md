---
code: true
type: page
title: lset
---

# lset

Sets the list element at `index` with the provided value.

[[_Redis documentation_]](https://redis.io/commands/lset)

## Arguments

```js
lset(key, index, value, [options]);
```

<br/>

| Arguments | Type               | Description                                                                                     |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `key`     | <pre>string</pre>  | List key                                                                                        |
| `index`   | <pre>integer</pre> | Index of the list (lists are 0-indexed). If negative, it goes backward from the end of the list |
| `value`   | <pre>string</pre>  | Value to set                                                                                    |
| `options` | <pre>object</pre>  | Optional query arguments                                                                        |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves once the new value is set.

## Usage

<<< ./snippets/lset.js
