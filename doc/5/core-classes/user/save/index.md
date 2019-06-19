---
code: false
type: page
title: save
description: User:save
---

# save

Creates or replaces this user in Kuzzle.

---

## save([options], [callback])

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

## Return Value

Returns the `User` object to allow chaining.

---

## Callback Response

Returns a `User` object.

## Usage

<<< ./snippets/save-1.js
