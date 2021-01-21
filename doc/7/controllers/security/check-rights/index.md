---
code: true
type: page
title: checkRights
description: Checks if an API action can be executed by a user
---

# checkRights

<SinceBadge version="2.8.0"/>
<SinceBadge version="7.5.0"/>
Checks if the provided API request can be executed by a user.

---

```js
checkRights(kuid, requestPayload)
```

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `requestPayload` | <pre>object</pre> | Contains a [RequestPayload](/core/2/api/payloads/request) |

## `requestPayload`

The [RequestPayload](/core/2/api/payloads/request) must contains at least the following properties:

- `controller`: API controller
- `action`: API action

---

## Resolves

A boolean telling whether the provided request would have been allowed or not

## Usage

<<< ./snippets/check-rights.js
