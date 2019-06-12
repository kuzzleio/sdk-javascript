---
code: false
type: page
title: sdiffstore
description: MemoryStorage:sdiffstore
---

# sdiffstore

Computes the difference between the set of unique values stored at `key` and the other provided sets, and stores the result in the key stored at `destination`.

If the `destination` key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/sdiffstore)

---

## sdiffstore(key, keys, destination, [options], [callback])

| Arguments     | Type        | Description                                              |
| ------------- | ----------- | -------------------------------------------------------- |
| `key`         | string      | Key identifier to compare                                |
| `keys`        | array       | list of set keys to compare with the set stored at `key` |
| `destination` | string      | Destination key identifier                               |
| `options`     | JSON Object | Optional parameters                                      |
| `callback`    | function    | Callback                                                 |

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

Returns an integer containing the number of stored elements.

## Usage

<<< ./snippets/sdiffstore-1.js

> Callback response:

```json
3
```
