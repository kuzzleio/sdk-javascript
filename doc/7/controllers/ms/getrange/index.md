---
code: true
type: page
title: getrange
---

# getrange

Returns a substring of a key's value.

[[_Redis documentation_]](https://redis.io/commands/getrange)

## Arguments

```js
getrange(key, start, end, [options]);
```

<br/>

| Arguments | Type               | Description              |
| --------- | ------------------ | ------------------------ |
| `key`     | <pre>string</pre>  | Key                      |
| `start`   | <pre>integer</pre> | Range start              |
| `end`     | <pre>integer</pre> | Range end                |
| `options` | <pre>object</pre>  | Optional query arguments |

The arguments `start` and `end` can be negative. In that case, the offset is calculated from the end of the string, going backward. For instance, -3 is the third character from the end of the string.

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the extracted substring.

## Usage

<<< ./snippets/getrange.js
