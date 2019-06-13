---
code: false
type: page
title: delete
description: User:delete
---

# delete

Deletes the user in Kuzzle.

---

## delete([options], [callback])

| Arguments  | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `options`  | JSON Object | Optional parameters                       |
| `callback` | function    | (Optional) Callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a `String` containing the id of the deleted user.

## Usage

<<< ./snippets/delete-1.js
