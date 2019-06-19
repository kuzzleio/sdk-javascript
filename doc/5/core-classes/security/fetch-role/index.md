---
code: false
type: page
title: fetchRole
description: Security:fetchRole
---

# fetchRole

Fetches a single stored role using its unique ID.

---

## fetchRole(id, [options], callback)

| Arguments  | Type        | Description                    |
| ---------- | ----------- | ------------------------------ |
| `id`       | string      | Unique role identifier         |
| `options`  | JSON Object | Optional parameters            |
| `callback` | function    | Callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a [Role](/sdk/js/5/core-classes/role) object.

## Usage

<<< ./snippets/fetch-role-1.js
