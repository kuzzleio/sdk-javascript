---
code: false
type: page
title: hasCredentials
description: Security:hasCredentials
---

# hasCredentials

Checks if a user has credentials for the provided strategy.

---

## hasCredentials(strategy, kuid, [options], callback)

| Arguments  | Type        | Description                       |
| ---------- | ----------- | --------------------------------- |
| `strategy` | string      | Strategy to check for credentials |
| `kuid`     | JSON object | User's kuid                       |
| `options`  | JSON object | Optional parameters               |
| `callback` | function    | Callback handling the response    |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a boolean value.

## Usage

<<< ./snippets/has-credentials-1.js
