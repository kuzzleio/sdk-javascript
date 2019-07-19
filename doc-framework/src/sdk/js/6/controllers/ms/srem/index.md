---
code: true
type: page
title: srem
---

# srem

Removes members from a set of unique values.

[[_Redis documentation_]](https://redis.io/commands/srem)

## Arguments

```js
srem(key, members, [options]);
```

<br/>

| Arguments | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `key`     | <pre>string</pre>   | Set key                   |
| `members` | <pre>string[]</pre> | List of members to remove |
| `options` | <pre>object</pre>   | Optional query arguments  |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of removed members.

## Usage

<<< ./snippets/srem.js
