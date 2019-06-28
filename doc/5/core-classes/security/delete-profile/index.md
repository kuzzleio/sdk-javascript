---
code: false
type: page
title: deleteProfile
description: Security:deleteProfile
---

# deleteProfile

Delete the provided profile.

<div class="alert alert-info">
There is a small delay between the time a profile is deleted and it being reflected in the search layer (usually a couple of seconds).
That means that a profile that was just deleted may still be returned by the <code>searchProfiles</code> function at first.
</div>

---

## deleteProfile(id, [options], [callback])

| Arguments  | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `id`       | string      | Unique profile identifier to delete       |
| `options`  | JSON Object | Optional parameters                       |
| `callback` | function    | (Optional) Callback handling the response |

---

## Options

| Option     | Type    | Description                                                                                                                  | Default     |
| ---------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `queuable` | boolean | Make this request queuable or not                                                                                            | `true`      |
| `refresh`  | string  | If set to `wait_for`, Kuzzle will wait the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |

---

## Return Value

Returns the `Security` object to allow chaining.

---

## Callback Response

Returns the ID of the security profile that has been deleted.

## Usage

<<< ./snippets/delete-profile-1.js

> Callback response

```json
"deleted profile identifier"
```
