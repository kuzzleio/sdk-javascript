---
code: false
type: page
title: delete
description: Profile:delete
---

# delete

Deletes this security profile from Kuzzle.

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

Returns the ID of the deleted profile.

## Usage

<<< ./snippets/delete-1.js
