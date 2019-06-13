---
code: false
type: page
title: getset
description: MemoryStorage:getset
---

# getset

Sets a new value for a key and returns its previous value.

[[_Redis documentation_]](https://redis.io/commands/getset)

---

## getset(key, value, [options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `value`    | string      | Key's new value     |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns the key's previous value.

## Usage

<<< ./snippets/getset-1.js

> Callback response:

```json
"value"
```
