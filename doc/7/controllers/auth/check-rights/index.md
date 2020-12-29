---
code: true
type: page
title: checkRights
description: Checks if an API action can be executed by the current user
---

# checkRights

<SinceBadge version="Kuzzle 2.8.0"/>
<SinceBadge version="auto-version"/>

Checks if the provided API request can be executed by a user.

---

```js
checkRights(kuid, requestPayload)
```

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `requestPayload` | <pre>object</pre> | Contains a [RequestPayload](/core/2/api/payloads/request) |

## Body properties

The body must contain a [RequestPayload](/core/2/api/payloads/request) with at least the following properties:

- `controller`: API controller
- `action`: API action

---

## Resolves

The returned result contains the following property:

- `allowed`: a boolean telling whether the provided request would have been allowed or not

```js
{
  "allowed": true
}
```

## Usage

<<< ./snippets/check-rights.js
