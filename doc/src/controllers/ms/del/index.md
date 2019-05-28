---
code: true
type: page
title: del
---

# del

Deletes a list of keys.

[[_Redis documentation_]](https://redis.io/commands/del)

## Arguments

```js
del(keys, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `keys`    | <pre>string[]</pre> | Keys to delete           |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of deleted keys.

## Usage

<<< ./snippets/del.js
