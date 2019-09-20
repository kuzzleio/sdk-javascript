---
code: true
type: page
title: keys
---

# keys

Returns all keys matching the provided pattern.

[[_Redis documentation_]](https://redis.io/commands/keys)

## Arguments

```js
keys(pattern, [options]);
```

<br/>

| Arguments | Type              | Description       |
| --------- | ----------------- | ----------------- |
| `pattern` | <pre>string</pre> | Match pattern     |
|           | `options`         | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to an array of key identifiers.

## Usage

<<< ./snippets/keys.js
