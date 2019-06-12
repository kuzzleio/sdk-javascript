---
code: false
type: page
title: rpushx
description: MemoryStorage:rpushx
---

# rpushx

Appends the specified value at the end of a list, only if the key already exists and if it holds a list.

[[_Redis documentation_]](https://redis.io/commands/rpushx)

---

## rpushx(key, value, [options], [callback])

| Arguments  | Type        | Description                         |
| ---------- | ----------- | ----------------------------------- |
| `key`      | string      | Key identifier                      |
| `value`    | string      | Value to add at the end of the list |
| `options`  | JSON Object | Optional parameters                 |
| `callback` | function    | Callback                            |

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

<<< ./snippets/rpushx-1.js

> Callback response:

```json
4
```
