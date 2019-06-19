---
code: false
type: page
title: updateMyCredentials
description: Kuzzle:updateMyCredentials
---

# updateMyCredentials

Update current user credentials for the specified `strategy`. The credentials to send depend on the authentication plugin and the strategy.

---

## updateMyCredentials(strategy, credentials, [options], [callback])

| Arguments     | Type        | Description                                |
| ------------- | ----------- | ------------------------------------------ |
| `strategy`    | string      | Strategy you want to create credentials in |
| `credentials` | JSON object | The credentials                            |
| `options`     | JSON object | Optional parameters                        |
| `callback`    | function    | Optional callback handling the response    |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback response

Returns an object reflecting the updated credentials.

## Usage

<<< ./snippets/update-my-credentials-1.js
