---
code: false
type: page
title: srandmember
description: MemoryStorage:srandmember
---

# srandmember

Returns one or more members of a set of unique values, at random.  
If `count` is provided and is positive, the returned values are unique. If `count` is negative, a set member can be returned multiple times.

[[_Redis documentation_]](https://redis.io/commands/srandmember)

---

## srandmember(key, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                                                                                                                                                    | Default |
| ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `count`    | int     | Number of members to return. If set with a positive value, the returned values are unique. If `count` is negative, a set member can be returned multiple times | `1`     |
| `queuable` | boolean | Make this request queuable or not                                                                                                                              | `true`  |

---

## Callback Response

Returns an array of members of a set of unique values.

## Usage

<<< ./snippets/srandmember-1.js

> Callback response:

```json
["member1", "member2", "..."]
```
