---
code: false
type: page
title: replace
description: User:replace
---

# replace

Replaces the user in Kuzzle.

---

## replace([options], [callback])

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

<<< ./snippets/replace-1.js
