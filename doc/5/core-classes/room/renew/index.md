---
code: false
type: page
title: renew
description: Room:renew
---

# renew

Renew the subscription. Force a new subscription using the same filters if no new ones are provided.

Unsubscribes first if this `Room` object was already listening to events.

---

## renew([filters], notificationCallback, subscriptionCallback)

| Arguments              | Type        | Description                                                                     |
| ---------------------- | ----------- | ------------------------------------------------------------------------------- |
| `filters`              | JSON Object | [Filters](/core/1/koncorde)                                                     |
| `notificationCallback` | function    | Function called each time a [notification](/sdk/js/5/essentials/realtime-notifications) is received |
| `subscriptionCallback` | function    | Function called with the subscription result                                    |

## Usage

<<< ./snippets/renew-1.js
