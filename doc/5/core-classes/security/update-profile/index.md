---
code: false
type: page
title: updateProfile
description: Security:updateProfile
---

# updateProfile

Performs a partial update on an existing profile.

---

## updateProfile(id, content, [options], [callback])

| Arguments  | Type             | Description                               |
| ---------- | ---------------- | ----------------------------------------- |
| `id`       | string           | Unique role identifier                    |
| `policies` | array of objects | List of policies to apply to this profile |
| `options`  | string           | (Optional) Optional arguments             |
| `callback` | function         | (Optional) Callback handling the response |

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

Return an updated [Profile](/sdk/js/5/core-classes/profile) object.

## Usage

<<< ./snippets/update-profile-1.js
