---
code: true
type: page
title: exists
---

# exists

Checks if the specified keys exist in the database.

[[_Redis documentation_]](https://redis.io/commands/exists)

## Arguments

```js
exists(keys, [options]);
```

<br/>

| Arguments | Type                | Description                 |
| --------- | ------------------- | --------------------------- |
| `keys`    | <pre>string[]</pre> | Keys to check for existence |
| `options` | <pre>object</pre>   | Optional query arguments    |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of existing keys.

## Usage

<<< ./snippets/exists.js
