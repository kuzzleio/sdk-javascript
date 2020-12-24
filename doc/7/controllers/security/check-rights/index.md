---
code: true
type: page
title: checkRights
---

# checkRights

<SinceBadge version="2.8.0"/>

Checks if the provided API request can be executed by a user.

---

```js
checkRights(_id, body)
```

| Property | Type | Description |
|--- |--- |--- |
| `_id` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `body` | <pre>object</pre> | Contains a `request` |

## Body properties

- `request`: API request to check

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