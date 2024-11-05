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
checkRights(requestPayload, [options])
```

| Property         | Type                         | Description                                                                                                           |
| ---------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `requestPayload` | <pre>object</pre>            | Contains a [RequestPayload](/core/2/api/payloads/request)
| `options`     | <pre>object</pre> | Query options   |                           

## `requestPayload`

The [RequestPayload](/core/2/api/payloads/request) must contains at least the following properties:

- `controller`: API controller
- `action`: API action

---
### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |
## Resolves

A boolean telling whether the provided request would have been allowed or not.

## Usage

<<< ./snippets/check-rights.js
