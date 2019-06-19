---
code: false
type: page
title: strlen
description: MemoryStorage:strlen
---

# strlen

Returns the length of a value stored at `key`.

[[_Redis documentation_]](https://redis.io/commands/strlen)

---

## strlen(key, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an integer containing the length of a value.

## Usage

<<< ./snippets/strlen-1.js

> Callback response:

```json
13
```
