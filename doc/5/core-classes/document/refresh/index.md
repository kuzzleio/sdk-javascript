---
code: false
type: page
title: refresh
description: Document:refresh
---

# refresh

Creates a new `Document` object with the last version of this document stored in Kuzzle.

---

## refresh([options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Return a new `Document` object containing the last document version.

## Usage

<<< ./snippets/refresh-1.js
