---
code: true
type: page
title: checkRights
description: Checks if an API action can be executed by the current user
---

# checkRights

<SinceBadge version="Kuzzle 2.8.0"/>
<SinceBadge version="auto-version"/>

Checks if the provided API request can be executed by the current logged user.

---

```js
checkRights(requestPayload)
```

| Property | Type | Description |
|--- |--- |--- |
| `requestPayload` | <pre>object</pre> | Contains a [RequestPayload](/core/2/api/payloads/request) |

## `requestPayload`

The body must contain a [RequestPayload](/core/2/api/payloads/request) with at least the following properties:

- `controller`: API controller
- `action`: API action

---

## Resolves

A boolean telling whether the provided request would have been allowed or not.

## Usage

<<< ./snippets/check-rights.js
