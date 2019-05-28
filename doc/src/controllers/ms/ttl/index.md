---
code: true
type: page
title: ttl
---

# ttl

Returns the remaining time to live of a key, in seconds.

[[_Redis documentation_]](https://redis.io/commands/ttl)

## Arguments

```js
ttl(key, [options]);
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

Resolves to the remaining key TTL, in seconds, or to a negative value if the key does not exist or if it is persistent.

## Usage

<<< ./snippets/ttl.js
