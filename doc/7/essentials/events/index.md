---
code: false
type: page
title: Events
description: SDK events system
order: 200
---

# Events

An event system allows to be notified when the SDK status changes. These events are issued by the [Kuzzle](/sdk/js/7/core-classes/kuzzle) SDK object.

The API for interacting with events is described by our [KuzzleEventEmitter](/sdk/js/7/core-classes/kuzzle-event-emitter) class documentation.

::: info
You can listen to every events on the SDK by using the events property:

```js
for (const event of kuzzle.events) {
  kuzzle.on(event, (...args) =>  console.log(event, ...args));
}
```

:::

**Note:** listeners are called in the order of their insertion.

# Emitted Events

## connected

Triggered when the SDK has successfully connected to Kuzzle.

## discarded

Triggered when Kuzzle discards a request, typically if no connection is established and the request is not queuable, either because the offline mode is not set or if set explicitely.

**Callback arguments:**

`@param {object} request`: the discarded [request](/core/2/guides/main-concepts/querying)

## disconnected

Triggered when the current session has been unexpectedly disconnected.

<SinceBadge version="7.7.0"/>
**Callback arguments:**

`@param {object} context`

| Property | Type              | Description                                |
| -------- | ----------------- | ------------------------------------------ |
| `origin` | <pre>string</pre> | Indicate what is causing the disconnection |

**Origins**

| Name                     | Description                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `websocket/auth-renewal` | The websocket protocol si reconnecting to renew the token. See [Websocket Cookie Authentication](sdk/js/7/protocols/websocket/introduction#cookie-authentication). |
| `user/connection-closed` | The disconnection is done by the user.                                                                                                                             |
| `network/error`          | An network error occured and caused a disconnection.                                                                                                               |
## loginAttempt

Triggered when a login attempt completes, either with a success or a failure result.

**Callback arguments:**

`@param {object} data`

| Property  | Type               | Description                       |
| --------- | ------------------ | --------------------------------- |
| `success` | <pre>boolean</pre> | Indicate if login attempt succeed |
| `error`   | <pre>string</pre>  | Error message when login fail     |

## networkError

Triggered when the SDK has failed to connect to Kuzzle.

**Callback arguments:**

`@param {Error} error`

| Property  | Type              | Description                        |
| --------- | ----------------- | ---------------------------------- |
| `message` | <pre>string</pre> | Error description                  |
| `status`  | <pre>number</pre> | Error code                         |
| `stack`   | <pre>string</pre> | Stacktrace (development mode only) |

## offlineQueuePop

Triggered whenever a request is removed from the offline queue.

**Callback arguments:**

`@param {object} request`: the [request](/core/2/guides/main-concepts/querying) removed from the queue

## offlineQueuePush

Triggered whenever a request is added to the offline queue.

**Callback arguments:**

`@param {object} data`

| Property  | Type              | Description                                                         |
| --------- | ----------------- | ------------------------------------------------------------------- |
| `request` | <pre>object</pre> | [Request](/core/2/guides/main-concepts/querying) added to the queue |

## queryError

Triggered whenever Kuzzle responds with an error

**Callback arguments:**

`@param {KuzzleError} error - Error details`

`@param {object} request - Request that caused the error`

## reconnected

Triggered when the current session has reconnected to Kuzzle after a disconnection, and only if `autoReconnect` is set to `true`.

## tokenExpired

Triggered when Kuzzle rejects a request because the authentication token has expired.
