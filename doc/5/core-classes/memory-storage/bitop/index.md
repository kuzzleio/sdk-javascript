---
code: false
type: page
title: bitop
description: MemoryStorage:bitop
---

# bitop

Performs a bitwise operation between multiple keys (containing string values) and stores the result in the destination key.

[[_Redis documentation_]](https://redis.io/commands/bitop)

---

## bitop(key, operation, keys, [options], [callback])

| Arguments   | Type        | Description                                                                 |
| ----------- | ----------- | --------------------------------------------------------------------------- |
| `key`       | string      | Destination key identifier                                                  |
| `operation` | string      | Bitwise operation to perform.<br/>Allowed values: `AND`, `OR`, `XOR`, `NOT` |
| `keys`      | array       | list of source keys on which the bitwise operation will be applied          |
| `options`   | JSON Object | Optional parameters                                                         |
| `callback`  | function    | Callback                                                                    |

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

Returns an integer containing the length of the new key's value.

## Usage

<<< ./snippets/bitop-1.js

> Callback response:

```json
42
```
