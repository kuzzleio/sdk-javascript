---
code: true
type: page
title: msetnx
---

# msetnx

Sets the provided keys to their respective values, only if they do not exist. If a key exists, then the whole operation is aborted and no key is set.

[[_Redis documentation_]](https://redis.io/commands/msetnx)

## Arguments

```js
msetnx(entries, [options]);
```

<br/>

| Arguments | Type                | Description                    |
| --------- | ------------------- | ------------------------------ |
| `entries` | <pre>object[]</pre> | List of key-value pairs to set |
| `options` | <pre>object</pre>   | Optional query arguments       |

### entries

The `entries` argument is an array of objects. Each object is a key-value pair, defined with the following properties:

| Property | Type              | Description |
| -------- | ----------------- | ----------- |
| `key`    | <pre>string</pre> | Key         |
| `value`  | <pre>\*</pre>     | Value       |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to a boolean telling whether the keys have been set or not.

## Usage

<<< ./snippets/msetnx.js
