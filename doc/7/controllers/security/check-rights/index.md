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
checkRights(kuid, requestPayload, [options])
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
### options

Additional query options

| Option     | Type<br/>(default)           | Description                                                                                                           |
| ---------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>bool</pre><br/>(`true`) | Make this request queuable or not                                                                                     |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A boolean telling whether the provided request would have been allowed or not

## Usage

<<< ./snippets/check-rights.js
