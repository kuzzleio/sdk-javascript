---
code: false
type: page
title: create
description: User:create
---

# create

Create the user in Kuzzle. Credentials can be created during the process by using [setCredentials](/sdk/js/5/core-classes/user/set-credentials) beforehand.

---

## create([options], [callback])

| Arguments  | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `options`  | JSON Object | Optional parameters                       |
| `callback` | function    | (Optional) Callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `User` object to allow chaining.

---

## Callback Response

Returns a `User` object.

## Usage

<<< ./snippets/create-1.js
