---
code: true
type: page
title: linsert
---

# linsert

Inserts a value in a list, either before or after a pivot value.

[[_Redis documentation_]](https://redis.io/commands/linsert)

## Arguments

```js
linsert(key, position, pivot, value, [options]);
```

<br/>

| Arguments  | Type              | Description                                                           |
| ---------- | ----------------- | --------------------------------------------------------------------- |
| `key`      | <pre>string</pre> | List key                                                              |
| `position` | <pre>string</pre> | Position relative to the pivot.<br/>Allowed values: `before`, `after` |
| `pivot`    | <pre>string</pre> | Existing list value to use as a pivot                                 |
| `value`    | <pre>string</pre> | Value to insert                                                       |
| `options`  | <pre>object</pre> | Optional query arguments                                              |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the updated length of the list.

## Usage

<<< ./snippets/linsert.js
