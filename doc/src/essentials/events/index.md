---
code: false
type: page
title: Events
description: SDK events system
order: 200
---

# Events

An event system allows to be notified when the SDK status changes. These events are issued by the [Kuzzle](/sdk/js/6/kuzzle) SDK object.

The API for interacting with events is described by our [KuzzleEventEmitter](/sdk-reference/js/6/kuzzle-event-emitter) class documentation.

**Note:** listeners are called in the order of their insertion.

# Emitted Events

## connected

Triggered when the SDK has successfully connected to Kuzzle.

## discarded

Triggered when Kuzzle discards a request, typically if no connection is established and the request is not queuable, either because the offline mode is not set or if set explicitely.

**Callback arguments:**

`@param {object} request`: the discarded [request](/core/1/api/essentials/query-syntax/)

## disconnected

Triggered when the current session has been unexpectedly disconnected.

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

`@param {object} request`: the [request](/core/1/api/essentials/query-syntax/) removed from the queue

## offlineQueuePush

Triggered whenever a request is added to the offline queue.

**Callback arguments:**

`@param {object} data`

| Property  | Type              | Description                                                        |
| --------- | ----------------- | ------------------------------------------------------------------ |
| `request` | <pre>object</pre> | [Request](/core/1/api/essentials/query-syntax/) added to the queue |

## queryError

Triggered whenever Kuzzle responds with an error

**Callback arguments:**

`@param {object} data`

| Property  | Type              | Description                   |
| --------- | ----------------- | ----------------------------- |
| `request` | <pre>object</pre> | Request that causing an error |
| `error`   | <pre>Error</pre>  | Error details                 |

## reconnected

Triggered when the current session has reconnected to Kuzzle after a disconnection, and only if `autoReconnect` is set to `true`.

## tokenExpired

Triggered when Kuzzle rejects a request because the authentication token has expired.
