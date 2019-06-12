---
code: false
type: page
title: set
description: MemoryStorage:set
---

# set

Creates a key holding the provided value, or overwrites it if it already exists.

[[_Redis documentation_]](https://redis.io/commands/set)

---

## set(key, value, [options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `value`    | string      | Value to store      |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                                   | Default |
| ---------- | ------- | --------------------------------------------- | ------- |
| `ex`       | int     | Time to live of the key, in seconds           | `0`     |
| `nx`       | boolean | Set the key only if it does not already exist | `false` |
| `px`       | int     | Time to live of the key, in milliseconds      | `0`     |
| `queuable` | boolean | Make this request queuable or not             | `true`  |
| `xx`       | boolean | Set the key only if it already exists         | `false` |

---

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns null if successful.

## Usage

<<< ./snippets/set-1.js
