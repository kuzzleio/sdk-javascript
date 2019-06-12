---
code: false
type: page
title: logout
description: Kuzzle:logout
---

# logout

Logs the user out.

<div class="alert alert-info">
This method is non-queuable, meaning that during offline mode, it will be discarded and the callback will be called with an error.
</div>

---

## logout([callback])

| Arguments  | Type     | Description                             |
| ---------- | -------- | --------------------------------------- |
| `callback` | function | Optional callback handling the response |

This method empties the `jwtToken` property

---

## Return value

Returns the `Kuzzle` SDK object to allow chaining.

---

## Callback Response

Returns the `Kuzzle` SDK object once the logout process is complete, either successfully or not.  
The `Kuzzle` SDK object will unset the `jwtToken` property if the user is successfully logged out.

## Usage

<<< ./snippets/logout-1.js
