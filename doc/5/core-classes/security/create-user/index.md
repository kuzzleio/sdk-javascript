---
code: false
type: page
title: createUser
description: Security:createUser
---

# createUser

Create a new user in Kuzzle.

<div class="alert alert-info">
There is a small delay between user creation and its availability in our search layer (usually a couple of seconds).
That means that a user that was just created may not be returned by the <code>searchUsers</code> function at first.
</div>

---

## createUser(id, user, [options], [callback])

| Arguments  | Type        | Description                                                                                                                  |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `id`       | string      | [Unique user identifier](/core/1/guides/essentials/user-authentication/#kuzzle-user-identifier-kuid)                   |
| `user`     | JSON Object | A plain JSON object representing the user (see below)                                                                        |
| `options`  | string      | (Optional) Optional arguments                                                                                                |
| `callback` | function    | Callback handling the response                                                                                               |
| `refresh`  | string      | If set to `wait_for`, Kuzzle will wait the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |

The `user` object to provide must have the following properties:

- `content` (JSON object): user global properties
  - This object must contain a `profileIds` properties, an array of strings listing the security [profiles](/core/1/guides/essentials/security/#users-profiles-and-roles) to be attached to the new user
  - Any other property will be copied as additional global user information
- `credentials` (JSON object): a description of how the new user can identify themselves on Kuzzle
  - Any number of credentials can be added, each one being an object with name equal to the [authentication strategy](/core/1/plugins/guides/strategies/#exposing-authentication-strategies) used to authenticate the user, and with the login data as content.
  - If this object is left empty, the user will be created in Kuzzle but the will not be able to login.

---

## Options

| Filter     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a [User](/sdk/js/5/core-classes/user) object.

## Usage

<<< ./snippets/create-user-1.js
