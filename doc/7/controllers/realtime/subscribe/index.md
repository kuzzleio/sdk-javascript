---
code: true
type: page
title: subscribe
description: Subscribe to real-time notifications
---

# subscribe

Subscribes by providing a set of filters: messages, document changes and, optionally, user events matching the provided filters will generate [real-time notifications](/core/2/api/payloads/notifications), sent to you in real-time by Kuzzle.

<br/>

```js
subscribe(index, collection, filters, callback, [options]);
```

<br/>

| Arguments    | Type                | Description                                                                     |
| ------------ | ------------------- | ------------------------------------------------------------------------------- |
| `index`      | <pre>string</pre>   | Index name                                                                      |
| `collection` | <pre>string</pre>   | Collection name                                                                 |
| `filters`    | <pre>object</pre>   | Set of filters following [Koncorde syntax](/core/2/api/koncorde-filters-syntax) |
| `callback`   | <pre>function</pre> | Callback function to handle notifications                                       |
| `options`    | <pre>object</pre>   | Query options                                                                   |

### callback

Callback function that will be called each time a new notifications is received.
The callback will receive the [notifications object](/sdk/js/7/essentials/realtime-notifications) as only argument.

### options

Additional subscription options.

| Property          | Type<br/>(default)              | Description                                                                                                           |
| ----------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `scope`           | <pre>string</pre><br/>(`all`)   | Subscribe to document entering or leaving the scope</br>Possible values: `all`, `in`, `out`, `none`                   |
| `users`           | <pre>string</pre><br/>(`none`)  | Subscribe to users entering or leaving the room</br>Possible values: `all`, `in`, `out`, `none`                       |
| `subscribeToSelf` | <pre>boolean</pre><br/>(`true`) | Subscribe to notifications fired by our own queries                                                                   |
| `volatile`        | <pre>object</pre><br/>(`null`)  | subscription information, used in [user join/leave notifications](/core/2/guides/main-concepts/api#volatile-data)     |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>  (`-1`)        | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Resolves to a string containing the room ID

## Usage

_Simple subscription to document notifications_

<<< ./snippets/document-notifications.js

_Subscription to document notifications with scope option_

<<< ./snippets/document-notifications-leave-scope.js

_Subscription to message notifications_

<<< ./snippets/message-notifications.js

_Subscription to user notifications_

<<< ./snippets/user-notifications.js
