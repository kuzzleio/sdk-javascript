---
code: true
type: page
title: sinter
---

# sinter

Returns the intersection of the provided sets of unique values.

[[_Redis documentation_]](https://redis.io/commands/sinter)

## Arguments

```js
sinter(keys, [options]);
```

<br/>

| Arguments | Type                | Description                   |
| --------- | ------------------- | ----------------------------- |
| `keys`    | <pre>string[]</pre> | List of set keys to intersect |
| `options` | <pre>object</pre>   | Optional query arguments      |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to an array of intersected values.

## Usage

<<< ./snippets/sinter.js
