---
code: true
type: page
title: sunion
---

# sunion

Returns the union of sets of unique values.

[[_Redis documentation_]](https://redis.io/commands/sunion)

## Arguments

```js
sunion(keys, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `keys`    | <pre>string[]</pre> | List of set keys         |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the result of the union between the provided sets.

## Usage

<<< ./snippets/sunion.js
