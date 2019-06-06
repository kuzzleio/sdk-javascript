---
code: true
type: page
title: hmset
---

# hmset

Sets multiple fields at once in a hash.

[[_Redis documentation_]](https://redis.io/commands/hmset)

## Arguments

```js
hmset(key, entries, [options]);
```

<br/>

| Arguments | Type                | Description                      |
| --------- | ------------------- | -------------------------------- |
| `key`     | <pre>string</pre>   | Hash key                         |
| `entries` | <pre>object[]</pre> | List of field-value pairs to set |
| `options` | <pre>object</pre>   | Optional query arguments         |

### entries

The `entries` array lists the fields to set in the hash. Each entry object has the following properties:

| Properties | Type              | Description |
| ---------- | ----------------- | ----------- |
| `field`    | <pre>string</pre> | Field name  |
| `value`    | <pre>string</pre> | Field value |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves once the fields have been set.

## Usage

<<< ./snippets/hmset.js
