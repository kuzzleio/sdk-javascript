---
code: false
type: page
title: flushdb
description: MemoryStorage:flushdb
---

# flushdb

Deletes all the keys of the database dedicated to client applications (the reserved space for Kuzzle is unaffected).

[[_Redis documentation_]](https://redis.io/commands/flushdb)

---

## flushdb([options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
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

Returns null if successful.

## Usage

<<< ./snippets/flushdb-1.js
