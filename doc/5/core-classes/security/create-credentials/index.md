---
code: false
type: page
title: createCredentials
description: Security:createCredentials
---

# createCredentials

Create credentials of user with `kuid` for the specified `strategy`.

---

## createCredentials(strategy, kuid, credentials, [options], [callback])

| Arguments     | Type        | Description                                |
| ------------- | ----------- | ------------------------------------------ |
| `strategy`    | string      | Strategy you want to create credentials in |
| `kuid`        | string      | User's kuid                                |
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

Returns an object with the created credentials.

## Usage

<<< ./snippets/create-credentials-1.js

> Callback response

```json
{
  "username": "foo",
  "kuid": "<Kuzzle Unique Identifier>"
}
```
