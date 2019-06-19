---
code: false
type: page
title: time
description: MemoryStorage:time
---

# time

Returns the current server time.

[[_Redis documentation_]](https://redis.io/commands/time)

---

## time([options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an array containing the following two items, in this order:

- a timestamp in [Epoch time](https://en.wikipedia.org/wiki/Unix_time)
- the number of microseconds already elapsed in the current second

## Usage

<<< ./snippets/time-1.js

> Callback response:

```json
[1488791347, 494938]
```
