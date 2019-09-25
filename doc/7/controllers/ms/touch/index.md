---
code: true
type: page
title: touch
---

# touch

Alters the last access time of the provided keys. A key is ignored if it does not exist.

[[_Redis documentation_]](https://redis.io/commands/touch)

## Arguments

```js
touch(keys, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `keys`    | <pre>string[]</pre> | List of keys to alter    |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of altered keys.

## Usage

<<< ./snippets/touch.js
