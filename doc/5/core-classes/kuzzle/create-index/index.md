---
code: false
type: page
title: createIndex
description: Kuzzle:createIndex
---

# createIndex

Create a new empty index, with no associated mapping.

---

## createIndex([index], [options], callback)

| Arguments  | Type        | Description                                                                                         |
| ---------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `index`    | string      | Optional index to query. If no set, defaults to [Kuzzle.defaultIndex](/sdk/js/5/core-classes/kuzzle/#properties) |
| `options`  | JSON object | Optional parameters                                                                                 |
| `callback` | function    | Callback handling the response                                                                      |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an object with the index creation status.

## Usage

<<< ./snippets/create-index-1.js

> Callback response:

```json
{
  "acknowledged": true,
  "shards_acknowledged": true
}
```
