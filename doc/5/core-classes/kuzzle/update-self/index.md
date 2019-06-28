---
code: false
type: page
title: updateSelf
description: Kuzzle:updateSelf
---

# updateSelf

---

## updateSelf(content, [options], [callback])

Performs a partial update on the current user.

| Arguments  | Type        | Description                                     |
| ---------- | ----------- | ----------------------------------------------- |
| `content`  | JSON Object | A plain javascript object representing the user |
| `options`  | string      | (Optional) Optional arguments                   |
| `callback` | function    | (Optional) Callback handling the response       |

---

## Options

| Filter     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return value

Returns the `Kuzzle` SDK object to allow chaining.

---

## Callback Response

Returns the updated user object.

## Usage

<<< ./snippets/update-self-1.js
