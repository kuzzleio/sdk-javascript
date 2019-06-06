---
code: true
type: page
title: ping
---

# ping

Pings the memory storage database.

[[_Redis documentation_]](https://redis.io/commands/ping)

## Arguments

```js
ping([options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the string `PONG`.

## Usage

<<< ./snippets/ping.js
