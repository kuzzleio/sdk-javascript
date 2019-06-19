---
code: false
type: page
title: createProfile
description: Security:createProfile
---

# createProfile

Create a new profile in Kuzzle.

<div class="alert alert-info">
There is a small delay between profile creation and its availability in our search layer (usually a couple of seconds).
That means that a profile that was just created might not be returned by the <code>searchProfiles</code> function at first.
</div>

---

## createProfile(id, content, [options], callback)

| Arguments  | Type                  | Description                               |
| ---------- | --------------------- | ----------------------------------------- |
| `id`       | string                | Unique profile identifier                 |
| `policies` | array of JSON objects | List of policies to apply to this profile |
| `options`  | string                | (Optional) Optional arguments             |
| `callback` | function              | Callback handling the response            |

---

## Options

| Filter           | Type    | Description                                                                                                                  | Default     |
| ---------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `queuable`       | boolean | Make this request queuable or not                                                                                            | `true`      |
| `replaceIfExist` | boolean | If the same profile already exists: throw an error if sets to false. Replace the existing profile otherwise                  | `false`     |
| `refresh`        | string  | If set to `wait_for`, Kuzzle will wait the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |

---

## Callback Response

Returns a security [Profile](/sdk/js/5/core-classes/profile) object.

## Usage

<<< ./snippets/create-profile-1.js
