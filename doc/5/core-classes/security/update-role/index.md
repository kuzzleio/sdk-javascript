---
code: false
type: page
title: updateRole
description: Security:updateRole
---

# updateRole

Performs a partial update on an existing role.

---

## updateRole(id, content, [options], [callback])

| Arguments  | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `id`       | string      | Unique role identifier                    |
| `content`  | JSON Object | A plain JSON object representing the role |
| `options`  | string      | (Optional) Optional arguments             |
| `callback` | function    | (Optional) Callback handling the response |

---

## Options

| Filter     | Type    | Description                                                                                                                      | Default     |
| ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `queuable` | boolean | Make this request queuable or not                                                                                                | `true`      |
| `refresh`  | string  | If set to `wait_for`, Kuzzle will wait for the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |

---

## Return Value

Returns the `Security` object to allow chaining.

---

## Callback Response

Returns an updated [Role](/sdk/js/5/core-classes/role) object.

## Usage

<<< ./snippets/update-role-1.js
