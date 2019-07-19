---
code: true
type: page
title: lpop
---

# lpop

Removes and returns the first element of a list.

[[_Redis documentation_]](https://redis.io/commands/lpop)

## Arguments

```js
lpop(key, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | List key                 |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the value extracted from the list.

## Usage

<<< ./snippets/lpop.js
