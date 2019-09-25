---
code: true
type: page
title: rpoplpush
---

# rpoplpush

Removes the last element of a list, and pushes it back at the start of another list.

[[_Redis documentation_]](https://redis.io/commands/rpoplpush)

## Arguments

```js
rpoplpush(src, dest, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `src`     | <pre>string</pre> | Source key               |
| `dest`    | <pre>string</pre> | Destination key          |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the value of the moved element.

## Usage

<<< ./snippets/rpoplpush.js
