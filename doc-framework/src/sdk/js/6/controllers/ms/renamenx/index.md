---
code: true
type: page
title: renamenx
---

# renamenx

Renames a key, only if the new name is not already used.

[[_Redis documentation_]](https://redis.io/commands/renamenx)

## Arguments

```js
renamenx(src, dest, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `src`     | <pre>string</pre> | Key to rename            |
| `dest`    | <pre>string</pre> | New key name             |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to a boolean telling whether the operation succeeded or not.

## Usage

<<< ./snippets/renamenx.js
