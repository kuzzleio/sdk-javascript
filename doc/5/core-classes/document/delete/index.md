---
code: false
type: page
title: delete
description: Document:delete
---

# delete

Deletes this document in Kuzzle.

---

## delete([options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Optional callback   |

---

## Options

| Option     | Type        | Description                                                                                                                      | Default     |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `volatile` | JSON Object | Additional information passed to notifications to other users                                                                    | `null`      |
| `queuable` | boolean     | Make this request queuable or not                                                                                                | `true`      |
| `refresh`  | string      | If set to `wait_for`, Kuzzle will wait for the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |

---

## Callback Response

Returns a string containing the ID of the deleted document.

## Usage

<<< ./snippets/delete-1.js
