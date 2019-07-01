---
code: true
type: page
title: rpop
---

# rpop

Removes the last element of a list and returns it.

[[_Redis documentation_]](https://redis.io/commands/rpop)

## Arguments

```js
rpop(key, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | List key                 |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the removed element.

## Usage

<<< ./snippets/rpop.js
