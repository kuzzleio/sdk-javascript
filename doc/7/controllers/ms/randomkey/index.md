---
code: true
type: page
title: randomkey
---

# randomkey

Returns a key identifier from the memory storage, at random.

[[_Redis documentation_]](https://redis.io/commands/randomkey)

## Arguments

```js
randomkey([options]);
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

Resolves to a key identifier, at random.

## Usage

<<< ./snippets/randomkey.js
