---
code: true
type: page
title: sdiff
---

# sdiff

Returns the difference between a reference set and a list of other sets.

[[_Redis documentation_]](https://redis.io/commands/sdiff)

## Arguments

```js
sdiff(ref, sets, [options]);
```

<br/>

| Arguments | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| `ref`     | <pre>string</pre>   | Set key of reference                     |
| `sets`    | <pre>string[]</pre> | List of sets to compare to the reference |
| `options` | <pre>object</pre>   | Optional query arguments                 |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to an array of differences.

## Usage

<<< ./snippets/sdiff.js
