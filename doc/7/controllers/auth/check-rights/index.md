---
code: true
type: page
title: checkRights
description: Checks if an API action can be executed by the current user
---

# checkRights

<SinceBadge version="Kuzzle 2.8.0"/>
<SinceBadge version="7.5.0"/>

Checks if the provided API request can be executed by the current logged user.

---

```js
checkRights(requestPayload)
```

| Property         | Type                         | Description                                                                                                           |
| ---------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `requestPayload` | <pre>object</pre>            | Contains a [RequestPayload](/core/2/api/payloads/request)                                                             |
| `timeout`  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## `requestPayload`

The [RequestPayload](/core/2/api/payloads/request) must contains at least the following properties:

- `controller`: API controller
- `action`: API action

---

## Resolves

A boolean telling whether the provided request would have been allowed or not.

## Usage

<<< ./snippets/check-rights.js
