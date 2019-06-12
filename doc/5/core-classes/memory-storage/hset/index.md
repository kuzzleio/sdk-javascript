---
code: false
type: page
title: hset
description: MemoryStorage:hset
---

# hset

Sets a field and its value in a hash. If the key does not exist, a new key holding a hash is created. If the field already exists, its value is overwritten.

[[_Redis documentation_]](https://redis.io/commands/hset)

---

## hset(key, field, value, [options], [callback])

| Arguments  | Type        | Description                       |
| ---------- | ----------- | --------------------------------- |
| `key`      | string      | Key identifier                    |
| `field`    | string      | Field name to insert or to update |
| `value`    | string      | Associated field value            |
| `options`  | JSON Object | Optional parameters               |
| `callback` | function    | Callback                          |

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

Returns a boolean specifying if the operation was successful or not.

## Usage

<<< ./snippets/hset-1.js

> Callback response:

```json
true
```
