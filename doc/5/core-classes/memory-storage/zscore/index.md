---
code: false
type: page
title: zscore
description: MemoryStorage:zscore
---

# zscore

Returns the score of a member in a sorted set.

[[_Redis documentation_]](https://redis.io/commands/zscore)

---

## zscore(key, member, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `member`   | string      | Sorted set member   |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a floating point number containing the searched member's score.

## Usage

<<< ./snippets/zscore-1.js

> Callback response:

```json
1
```
