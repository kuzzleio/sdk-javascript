---
code: true
type: page
title: mget
---

# mget

Returns the values of the provided keys.

[[_Redis documentation_]](https://redis.io/commands/mget)

## Arguments

```js
mget(keys, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `keys`    | <pre>string[]</pre> | List of keys to get      |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the list of corresponding key values, in the same order than the one provided in the query.

## Usage

<<< ./snippets/mget.js
