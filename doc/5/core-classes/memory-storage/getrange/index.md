---
code: false
type: page
title: getrange
description: MemoryStorage:getrange
---

# getrange

Returns a substring of a key's value (index starts at position `0`).

[[_Redis documentation_]](https://redis.io/commands/getrange)

---

## getrange(key, start, end, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `start`    | int         | Starting index      |
| `end`      | int         | Ending index        |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a substring of the key's value.

## Usage

<<< ./snippets/getrange-1.js

> Callback response:

```json
"lue"
```
