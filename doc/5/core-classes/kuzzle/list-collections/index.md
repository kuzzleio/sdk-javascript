---
code: false
type: page
title: listCollections
description: Kuzzle:listCollections
---

# listCollections

Returns the list of known collections contained in a specified index.

---

## listCollections([index], [options], callback)

| Arguments  | Type        | Description                                   |
| ---------- | ----------- | --------------------------------------------- |
| `index`    | string      | Index containing the collections to be listed |
| `options`  | JSON Object | Optional parameters                           |
| `callback` | function    | Callback handling the response                |

---

## Options

| Option     | Type    | Description                                                                            | Default     |
| ---------- | ------- | -------------------------------------------------------------------------------------- | ----------- |
| `queuable` | boolean | Make this request queuable or not                                                      | `true`      |
| `from`     | integer | Determines the starting point of the pagination. By default, start at the beggining    | `0`         |
| `size`     | integer | Determines the size of the returned result set. By default, no limit is applied        | `undefined` |
| `type`     | string  | Get either `stored` collections or `realtime` ones. By default, list `all` collections | `all`       |

If no `index` argument is provided, the `defaultIndex` property is used. If no default index is found, this method throws an error.

---

## Callback Response

Returns an array of JSON objects containing the list of stored and/or realtime collections on the provided index.

## Usage

<<< ./snippets/list-collections-1.js

> Callback response:

```json
[
  { "name": "realtime_1", "type": "realtime" },
  { "name": "realtime_2", "type": "realtime" },
  { "name": "realtime_...", "type": "realtime" },
  { "name": "realtime_n", "type": "realtime" },
  { "name": "stored_1", "type": "stored" },
  { "name": "stored_2", "type": "stored" },
  { "name": "stored_...", "type": "stored" },
  { "name": "stored_n", "type": "stored" }
]
```
