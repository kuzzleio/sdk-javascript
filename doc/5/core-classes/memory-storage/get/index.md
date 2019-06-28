---
code: false
type: page
title: get
description: MemoryStorage:get
---

# get

Returns the value of a key, or null if the key doesn’t exist.

[[_Redis documentation_]](https://redis.io/commands/get)

---

## get(key, [options], callback)

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

Returns the key's value.

## Usage

<<< ./snippets/get-1.js

> Callback response:

```json
"value"
```
