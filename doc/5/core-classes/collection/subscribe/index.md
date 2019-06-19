---
code: false
type: page
title: subscribe
description: Collection:subscribe
---

# subscribe

Subscribes to this collection with a set of filters.

The provided callback will be called everytime a [notification](/sdk/js/5/essentials/realtime-notifications) is received from Kuzzle.

---

## subscribe(filters, [options], callback)

| Arguments  | Type        | Description                                                                 |
| ---------- | ----------- | --------------------------------------------------------------------------- |
| `filters`  | JSON Object | [Koncorde Filters](/core/1/koncorde)                                        |
| `options`  | object      | (Optional) Subscription configuration. Passed to the Room constructor.      |
| `callback` | function    | Callback to call every time a notification is received on this subscription |

---

## Options

| Option            | Type        | Description                                                                                                                                                                                                                                                                                                                                                   | Default |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `volatile`        | JSON Object | Additional information passed to notifications to other users                                                                                                                                                                                                                                                                                                 | `null`  |
| `scope`           | string      | Filter document notifications depending on their scope status. You may receive entering documents (scope: `in`), leaving documents (scope: `out`), all documents changes (scope: `all`) or filter these notifications completely (scope: `none`). This filter does not affect pub/sub messages or user events.                                                | `all`   |
| `state`           | string      | Filter document notifications depending on the state of the modifying request. You may receive real-time notifications when a document is about to be changed (state: `pending`), or be notified when the change has been fully written in the database (state: `done`), or both (state: `all`). This filter does not affect pub/sub messages or user events. | `done`  |
| `subscribeToSelf` | boolean     | (Don't) subscribe to notifications fired as a consequence of our own queries                                                                                                                                                                                                                                                                                  | `true`  |
| `users`           | string      | Filter notifications fired upon a user entering the room (user: `in`), leaving the room (user: `out`), or both (user: `all`). Setting this variable to `none` prevents receiving these notifications                                                                                                                                                          | `none`  |

The `options` object is directly passed to the Room constructor.
See the [Room object](/sdk/js/5/core-classes/room/) documentation for more information about these options and notifications.

---

## Return Value

Returns an object exposing the following method:
 `onDone(callback)`

The `callback` argument is called when the subscription ends, either successfully or with an error.

## Usage

<<< ./snippets/subscribe-1.js
