---
code: true
type: page
title: mset
---

# mset

Sets the provided keys to their respective values. If a key does not exist, it is created. Otherwise, the key's value is overwritten.

[[_Redis documentation_]](https://redis.io/commands/mset)

## Arguments

```js
mset(entries, [options]);
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

Resolves successfully once the keys are set.

## Usage

<<< ./snippets/mset.js
