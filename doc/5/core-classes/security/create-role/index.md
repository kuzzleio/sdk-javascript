---
code: false
type: page
title: createRole
description: Security:createRole
---

# createRole

Create a new role in Kuzzle.

<div class="alert alert-info">
There is a small delay between role creation and its availability in our search layer (usually a couple of seconds).
That means that a role that was just created may not be returned by the <code>searchRole</code> function at first.
</div>
---

## createRole(id, content, [options], callback)

| Arguments  | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `id`       | string      | Unique role identifier                    |
| `content`  | JSON Object | A plain JSON object representing the role |
| `options`  | string      | (Optional) Optional arguments             |
| `callback` | function    | Callback handling the response            |

---

## Options

| Filter           | Type    | Description                                                                                                                  | Default     |
| ---------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `replaceIfExist` | boolean | If the same role already exists: throw an error if sets to false. Replace the existing role otherwise                        | `false`     |
| `queuable`       | boolean | Make this request queuable or not                                                                                            | `true`      |
| `refresh`        | string  | If set to `wait_for`, Kuzzle will wait the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |

---

## Callback Response

Returns a [Role](/sdk/js/5/core-classes/role) object.

## Usage

<<< ./snippets/create-role-1.js
