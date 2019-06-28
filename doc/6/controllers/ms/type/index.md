---
code: true
type: page
title: type
---

# type

Returns the type of the value held by a key.

[[_Redis documentation_]](https://redis.io/commands/type)

## Arguments

```js
type(key, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Key                      |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to one of the following: `hash`, `list`, `string`, `set`, `zset`

## Usage

<<< ./snippets/type.js
