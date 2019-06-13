---
code: false
type: page
title: validateMyCredentials
description: Kuzzle:validateMyCredentials
---

# validateMyCredentials

Update current user's credentials for the specified `strategy`. The credentials to send depend on the authentication plugin and the strategy.

---

## validateMyCredentials(strategy, credentials, [options], callback)

| Arguments     | Type        | Description                                |
| ------------- | ----------- | ------------------------------------------ |
| `strategy`    | string      | Strategy you want to create credentials in |
| `credentials` | JSON object | The credentials                            |
| `options`     | JSON object | Optional parameters                        |
| `callback`    | function    | Callback handling the response             |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns true or false.

## Usage

<<< ./snippets/validate-my-credentials-1.js
