---
code: false
type: page
title: Events
order: 200
---

# Events

The [Kuzzle instance](/sdk/js/5/core-classes/kuzzle/) periodically emits named events that provide useful updates about the state of the Kuzzle client. To subscribe to these events, use the [addListener](/sdk/js/5/core-classes/kuzzle/add-listener) function and specify the event name and the callback function that will be executed when the event is emitted. To unsubscribe to an event, use the [removeListener](/sdk/js/5/core-classes/kuzzle/remove-listener) function, specifying the name of the event to remove.

---

## Emitted Events

| Event Name         | Callback arguments                                     | Description                                                                                                                      |
| ------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `connected`        | _(none)_                                               | Triggered when the SDK has successfully connected to Kuzzle                                                                      |
| `discarded`        | `error` (object)                                       | Triggered when Kuzzle rejects a request (e.g. request can't be parsed, request too large, ...)                                   |
| `disconnected`     | _(none)_                                               | Triggered when the current session has been unexpectedly disconnected                                                            |
| `loginAttempt`     | `{ "success": <boolean>, "error": "<error message>" }` | Triggered when a login attempt completes, either with a success or a failure result                                              |
| `networkError`     | `error` (object)                                       | Triggered when the SDK has failed to connect to Kuzzle. Does not trigger offline mode.                                           |
| `offlineQueuePop`  | `query` (object)                                       | Triggered whenever a request is removed from the offline queue.                                                                  |
| `offlineQueuePush` | `{ "query": <object>, "cb": <function> }`              | Triggered whenever a request is added to the offline queue                                                                       |
| `queryError`       | `error` (object), `query` (object)                     | Triggered whenever Kuzzle responds with an error                                                                                 |
| `reconnected`      | _(none)_                                               | Triggered when the current session has reconnected to Kuzzle after a disconnection, and only if `autoReconnect` is set to `true` |
| `tokenExpired`     | _(none)_                                               | Triggered when Kuzzle rejected a request because the authentication token expired                                                |

**Note:** listeners are called in the order of their insertion.
