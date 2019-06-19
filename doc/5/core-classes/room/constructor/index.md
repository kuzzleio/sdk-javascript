---
code: false
type: page
title: constructor
description: Room:constructor
order: 1
---

# Constructors

The `Room` object is the result of a subscription request, allowing you to manipulate the subscription itself.

---

## Room(Collection, [options])

| Arguments    | Type   | Description                              |
| ------------ | ------ | ---------------------------------------- |
| `Collection` | object | an instantiated Kuzzle Collection object |
| `options`    | object | Optional subscription configuration      |

---

## Options

| Option            | Type        | Description                                                                                                                                                                                                                                                                                                                                                                                                     | Default |
| ----------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `volatile`        | JSON Object | Additional information passed to notifications to other users                                                                                                                                                                                                                                                                                                                                                   | `null`  |
| `scope`           | string      | Filter [document notifications](/sdk/js/5/essentials/realtime-notifications/#document-notification) depending on their scope status. You may receive entering documents (scope: `in`), leaving documents (scope: `out`), all documents changes (scope: `all`) or filter these notifications completely (scope: `none`). This filter does not affect pub/sub messages or user events.                                                | `all`   |
| `state`           | string      | Filter [document notifications](/sdk/js/5/essentials/realtime-notifications/#document-notification) depending on the state of the modifying request. You may receive real-time notifications when a document is about to be changed (state: `pending`), or be notified when the change has been fully written in the database (state: `done`), or both (state: `all`). This filter does not affect pub/sub messages or user events. | `done`  |
| `subscribeToSelf` | boolean     | (Don't) subscribe to notifications fired as a consequence of our own queries                                                                                                                                                                                                                                                                                                                                    | `true`  |
| `users`           | string      | Filter [user notifications](/sdk/js/5/essentials/realtime-notifications/#user-notification) triggered upon a user entering the room (user: `in`), leaving the room (user: `out`), or both (user: `all`). Setting this variable to `none` prevents receiving these notifications                                                                                                                                                     | `none`  |

---

## Properties

| Property name     | Type        | Description                                                                  | get/set |
| ----------------- | ----------- | ---------------------------------------------------------------------------- | ------- |
| `collection`      | string      | The subscribed collection                                               | get     |
| `filters`         | JSON object | The current set of filters of this room                                      | get/set |
| `headers`         | JSON Object | Common headers for all sent documents.                                       | get/set |
| `volatile`        | JSON Object | Additional information passed to notifications to other users                | get/set |
| `subscribeToSelf` | boolean     | (Don't) subscribe to notifications fired as a consequence of our own queries | get/set |
| `roomId`          | string      | Unique room identifier                                                       | get     |

**Notes:**

- the `headers` property is inherited from the provided `Collection` object and can be overridden
- updating the `volatile` property takes effect only after the subscription is renewed
- by default, the global `volatile` properties are sent along with the subscription request. If a `volatile` option is provided during subscription, it will be merged with the global `volatile` for the subscription only. In case of conflicts, subscription `volatile` data takes priority over the global `volatile` ones.

## Usage

<<< ./snippets/constructor-1.js
