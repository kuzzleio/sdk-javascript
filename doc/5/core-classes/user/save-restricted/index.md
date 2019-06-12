---
code: false
type: page
title: saveRestricted
description: User:saveRestricted
---

# saveRestricted

## Saves this user as restricted in Kuzzle.

## saveRestricted([options], [callback])

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

<<< ./snippets/save-restricted-1.js
