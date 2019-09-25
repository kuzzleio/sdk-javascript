---
code: true
type: page
title: rpushx
---

# rpushx

Appends a value at the end of a list, only if the destination key already exists, and if it holds a list.

[[_Redis documentation_]](https://redis.io/commands/rpushx)

## Arguments

```js
rpushx(key, value, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | List key                 |
| `value`   | <pre>string</pre> | Value to append          |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the updated list length.

## Usage

<<< ./snippets/rpushx.js
