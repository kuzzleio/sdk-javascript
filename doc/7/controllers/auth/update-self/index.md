---
code: true
type: page
title: updateSelf
description: Updates the current user object in Kuzzle.
---

# updateSelf

Updates the currently logged in user content.

This route cannot update the list of associated security profiles. To change a user's security profiles, the route [security:updateUser](/core/2/api/controllers/security/update-user) must be used instead.

<br/>

```js
updateSelf(content, [options]);
```

<br/>

| Arguments | Type              | Description             |
| --------- | ----------------- | ----------------------- |
| `content` | <pre>object</pre> | User custom information |
| `options` | <pre>object</pre> | Query options           |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [User](/sdk/js/7/core-classes/user) representing the current user logged with the SDK.

## Usage

<<< ./snippets/update-self.js
