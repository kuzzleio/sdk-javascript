---
code: false
type: page
title: sort
description: MemoryStorage:sort
---

# sort

Sorts and returns elements contained in a list, a set of unique values or a sorted set.
By default, sorting is numeric and elements are compared by their value interpreted as double precision floating point number.

<div class="alert alert-info">
While Kuzzle's API supports the "store" option for this command, Kuzzle SDK methods do not. To sort and store in the same process, use the [query method](/sdk/js/5/core-classes/kuzzle/query)
</div>

[[_Redis documentation_]](https://redis.io/commands/sort)

### sort(key, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option      | Type    | Description                                                                                                                                                                                 | Default |
| ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `alpha`     | boolean | Perform an alphanumerical sort instead of a numeric one                                                                                                                                     | `false` |
| `by`        | string  | Instead of sorting the values stored at `key`, use them to complete the provided key pattern, and return the sorted list of values stored in those keys.                                    | `null`  |
| `direction` | string  | Sort in ascendant (`ASC`) or descendant (`DESC`) order                                                                                                                                      | `ASC`   |
| `get`       | array   | Sort the values stored at `key` but, instead of returning these directly, return the values contained in external keys, using the provided array of patterns completed by the sorted values | `null`  |
| `limit`     | array   | Limit the result set to a range of matching elements (similar to _SELECT LIMIT offset, count_ in SQL).<br/>Format: `[<offset(int)>, <count(int)>]`                                          | `null`  |
| `queuable`  | boolean | Make this request queuable or not                                                                                                                                                           | `true`  |

### Callback Response

Returns an array of sorted values.

## Usage

<<< ./snippets/sort-1.js

> Callback response:

```json
["sorted element1", "sorted element2", "..."]
```
