---
code: true
type: page
title: time
---

# time

Returns the current server time.

[[_Redis documentation_]](https://redis.io/commands/time)

## Arguments

```js
time([options]);
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

Resolves to the time as a two items array:

- a timestamp in [Epoch time](https://en.wikipedia.org/wiki/Unix_time)
- the number of microseconds already elapsed in the current second

## Usage

<<< ./snippets/time.js
