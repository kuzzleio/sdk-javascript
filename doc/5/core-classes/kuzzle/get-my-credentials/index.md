---
code: false
type: page
title: getMyCredentials
description: Kuzzle:getMyCredentials
---

# getMyCredentials

Get [credential information](/core/1/guides/essentials/user-authentication/#user-credentials) for the current user.

---

## getMyCredentials(strategy, [options], callback)

| Arguments  | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `strategy` | string      | Strategy you want to get credentials from |
| `options`  | JSON object | Optional parameters                       |
| `callback` | function    | Callback handling the response            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an object with the credentials for the provided authentication strategy.

## Usage

<<< ./snippets/get-my-credentials-1.js

> Callback response

```json
{
  "username": "foo",
  "kuid": "<Kuzzle Unique User Identifier>"
}
```
