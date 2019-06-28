---
code: true
type: page
title: lrem
---

# lrem

Removes the first occurences of an element from a list.

[[_Redis documentation_]](https://redis.io/commands/lrem)

## Arguments

```js
lrem(key, count, value, [options]);
```

<br/>

| Arguments | Type               | Description                                    |
| --------- | ------------------ | ---------------------------------------------- |
| `key`     | <pre>string</pre>  | List key                                       |
| `count`   | <pre>integer</pre> | Number of the first found occurences to remove |
| `value`   | <pre>string</pre>  | Value to remove                                |
| `options` | <pre>object</pre>  | Optional query arguments                       |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of removed elements.

## Usage

<<< ./snippets/lrem.js
