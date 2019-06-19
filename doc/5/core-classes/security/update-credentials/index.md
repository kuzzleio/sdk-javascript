---
code: false
type: page
title: updateCredentials
description: Security:updateCredentials
---

# updateCredentials

Update the current user's credentials for the specified `<strategy>`. The credentials to send depend on the authentication plugin and the strategy.

---

## updateCredentials(strategy, kuid, credentials, [options], [callback])

| Arguments     | Type        | Description                                |
| ------------- | ----------- | ------------------------------------------ |
| `strategy`    | string      | Strategy you want to create credentials in |
| `kuid`        | JSON object | User's kuid                                |
| `credentials` | JSON object | The credentials                            |
| `options`     | JSON object | Optional parameters                        |
| `callback`    | function    | Optional callback handling the response    |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an object with the updated credentials.

## Usage

<<< ./snippets/update-credentials-1.js

> Callback response

```json
{
  "username": "foo",
  "kuid": "<Kuzzle Unique User Identifier>"
}
```
