---
code: false
type: page
title: update
description: Profile:update
---

# update

Performs a partial content update on this object.

---

## update(content, [options], [callback])

| Arguments  | Type        | Description                             |
| ---------- | ----------- | --------------------------------------- |
| `content`  | JSON Object | Profile content                         |
| `options`  | JSON Object | Optional parameters                     |
| `callback` | function    | Optional callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `Profile` object to allow chaining.

---

## Callback Response

Returns the updated version of this object.

## Usage

<<< ./snippets/update-1.js
