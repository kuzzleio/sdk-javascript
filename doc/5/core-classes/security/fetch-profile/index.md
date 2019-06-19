---
code: false
type: page
title: fetchProfile
description: Security:fetchProfile
---

# fetchProfile

Fetches a single stored profile using its unique ID.

---

## fetchProfile(id, [options], callback)

| Arguments  | Type        | Description                    |
| ---------- | ----------- | ------------------------------ |
| `id`       | string      | Unique profile identifier      |
| `options`  | JSON Object | Optional parameters            |
| `callback` | function    | Callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a security [Profile](/sdk/js/5/core-classes/profile) object.

## Usage

<<< ./snippets/fetch-profile-1.js
