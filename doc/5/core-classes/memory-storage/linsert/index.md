---
code: false
type: page
title: linsert
description: MemoryStorage:linsert
---

# linsert

Inserts a value in a list, either before or after the reference pivot value.

[[_Redis documentation_]](https://redis.io/commands/linsert)

---

## linsert(key, position, pivot, value, [options], [callback])

| Arguments  | Type        | Description                                                                                                         |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `key`      | string      | Key identifier                                                                                                      |
| `position` | string      | Indicates if the new value is to be inserted before or after the pivot value.<br/>Allowed values: `before`, `after` |
| `pivot`    | string      | Pivot value used as a point of reference in the list                                                                |
| `value`    | string      | The value to insert                                                                                                 |
| `options`  | JSON Object | Optional parameters                                                                                                 |
| `callback` | function    | Callback                                                                                                            |

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

Returns an integer containing the updated number of items in the list.

## Usage

<<< ./snippets/linsert-1.js

> Callback response:

```json
4
```
