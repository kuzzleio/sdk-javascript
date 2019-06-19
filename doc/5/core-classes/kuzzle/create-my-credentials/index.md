---
code: false
type: page
title: createMyCredentials
description: Kuzzle:createMyCredentials
---

# createMyCredentials

Create the current user's credentials for the specified strategy. The credentials required will depend on the authentication plugin and strategy.

---

## createMyCredentials(strategy, credentials, [options], [callback])

| Arguments     | Type        | Description                                 |
| ------------- | ----------- | ------------------------------------------- |
| `strategy`    | string      | Strategy you want to create credentials for |
| `credentials` | JSON object | The credentials                             |
| `options`     | JSON object | Optional parameters                         |
| `callback`    | function    | Optional callback handling the response     |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an object with the created credentials.

## Usage

<<< ./snippets/create-my-credentials-1.js
