---
code: true
type: page
title: strlen
---

# strlen

Returns the length of a value.

[[_Redis documentation_]](https://redis.io/commands/strlen)

## Arguments

```js
strlen(key, [options]);
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

Resolves to the value's length.

## Usage

<<< ./snippets/strlen.js
