---
code: true
type: page
title: rename
---

# rename

Renames a key.

If the new key name is already used, then it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/rename)

## Arguments

```js
rename(src, dest, [options]);
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

Resolves once the operation succeeds.

## Usage

<<< ./snippets/rename.js
