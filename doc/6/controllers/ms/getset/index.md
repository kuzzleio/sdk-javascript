---
code: true
type: page
title: getset
---

# getset

Sets a new value for a key, and returns its previously stored value.

[[_Redis documentation_]](https://redis.io/commands/getset)

## Arguments

```js
getset(key, value, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Key                      |
| `value`   | <pre>\*</pre>     | New key value.           |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the previously set value, or `null` if the key didn't exist prior to this operation.

## Usage

<<< ./snippets/getset.js
