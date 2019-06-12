---
code: false
type: page
title: setJwtToken
description: Kuzzle:setJwtToken
---

# setJwtToken

Sets the internal JWT token which will be used when making requests to Kuzzle.

If the provided token is valid, a `loginAttempt` event is fired with the following object:  
`{ success: true }`

If not, the `loginAttempt` event is fired with the following response:  
`{ success: false, error: 'error message' }`

---

## setJwtToken(jwtToken)

| Arguments  | Type   | Description                         |
| ---------- | ------ | ----------------------------------- |
| `jwtToken` | string | Previously generated JSON Web Token |

---

## setJwtToken(kuzzleResponse)

| Arguments        | Type        | Description                                                 |
| ---------------- | ----------- | ----------------------------------------------------------- |
| `kuzzleResponse` | JSON object | Final Kuzzle response from a 2-steps authentication process |

---

## Return Value

Returns the `Kuzzle` SDK object to allow chaining.

## Usage

<<< ./snippets/set-jwt-token-1.js
