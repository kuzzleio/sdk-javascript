---
code: false
type: page
title: deleteUser
description: Security:deleteUser
---

# deleteUser

Delete the provided user.

<div class="alert alert-info">
There is a small delay between the time a user is deleted and it being reflected in the search layer (usually a couple of seconds).
That means that a user that has just been deleted may still be returned by the <code>searchUsers</code> function at first.
</div>

---

## deleteUser(id, [options], [callback])

| Arguments  | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `id`       | string      | Unique user identifier to delete          |
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

Return the id of the user that has been deleted.

## Usage

<<< ./snippets/delete-user-1.js

> Callback response

```json
"deleted user identifier"
```
