---
code: false
type: page
title: hincrby
description: MemoryStorage:hincrby
---

# hincrby

Increments the number stored in a hash field by the provided integer value.

[[_Redis documentation_]](https://redis.io/commands/hincrby)

---

## hincrby(key, field, value, [options], [callback])

| Arguments  | Type        | Description             |
| ---------- | ----------- | ----------------------- |
| `key`      | string      | Key identifier          |
| `field`    | string      | Hash field to increment |
| `value`    | int         | Increment value         |
| `options`  | JSON Object | Optional parameters     |
| `callback` | function    | Callback                |

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

Returns the newly incremented value.

## Usage

<<< ./snippets/hincrby-1.js

> Callback response:

```json
45
```
