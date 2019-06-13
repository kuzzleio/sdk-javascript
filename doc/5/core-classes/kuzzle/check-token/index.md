---
code: false
type: page
title: checkToken
description: Kuzzle:checkToken
---

# checkToken

> Callback response if the token is valid:

```json
{
  "expiresAt": 1454588077399,
  "valid": true
}
```

> Callback response if the token is invalid:

```json
{
  "valid": false,
  "state": "<invalidity reason>"
}
```

Checks the validity of a JSON Web Token.

<div class="alert alert-info">
This method is non-queuable, meaning that during offline mode, it will be discarded and the callback return an error.
</div>

---

## checkToken(token, callback)

| Arguments  | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| `token`    | string   | The token to check             |
| `callback` | function | Callback handling the response |

**Note:** this method sends an unauthenticated API call to Kuzzle, meaning it ignores the JWT Token property, even if it has been set.

---

## Callback Response

Returns a JSON object with a `valid` boolean property.  
If the token is valid, an `expiresAt` property is set with the expiration timestamp. If not, a `state` property is set explaining why the token is invalid.

## Usage

<<< ./snippets/check-token-1.js
