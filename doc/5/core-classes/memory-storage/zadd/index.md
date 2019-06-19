---
code: false
type: page
title: zadd
description: MemoryStorage:zadd
---

# zadd

Adds the specified elements to the sorted set stored at `key`. If the key does not exist, it is created, holding an empty sorted set. If it already exists and does not hold a sorted set, an error is returned.

Scores are expressed as floating point numbers.

If a member to insert is already in the sorted set, its score is updated and the member is reinserted at the right position in the set.

[[_Redis documentation_]](https://redis.io/commands/zadd)

---

## zadd(key, elements, [options], [callback])

| Arguments  | Type        | Description                                                                                                                                                    |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`      | string      | Key identifier                                                                                                                                                 |
| `elements` | array       | List of JSON objects detailing the element to add to the sorted set.<br/>Properties: `score` (element's score, `double`), `member` (element's value, `string`) |
| `options`  | JSON Object | Optional parameters                                                                                                                                            |
| `callback` | function    | Callback                                                                                                                                                       |

---

## Options

| Option     | Type    | Description                                                                                                                                                   | Default |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `ch`       | boolean | Instead of returning the number of added allements, return the total number of changes performed (including updates)                                          | `false` |
| `incr`     | boolean | Instead of adding elements, increment the existing member with the provided `score` value. Only one score+element pair can be specified if this option is set | `false` |
| `nx`       | boolean | Only add new elements, do not update existing ones                                                                                                            | `false` |
| `queuable` | boolean | Make this request queuable or not                                                                                                                             | `true`  |
| `xx`       | boolean | Never add new elements, update only exiting ones                                                                                                              | `false` |

---

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns an integer containing the number of elements added to the sorted set.

## Usage

<<< ./snippets/zadd-1.js

> Callback response:

```json
3
```
