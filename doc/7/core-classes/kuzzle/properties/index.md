---
code: false
type: page
title: Properties
description: Kuzzle class properties
order: 10
---

# Read-only properties

| Property name        | Type     | Description          |
| -------------------- | -------- | ---------------------|
| `authenticated` | <pre>boolean</pre> | Returns `true` if the SDK holds a valid token |
| `connected` | <pre>boolean</pre> | Returns `true` if the SDK is currently connected to a Kuzzle server. |
| `offlineQueue` | <pre>object[]</pre> | Contains the queued requests during offline mode   |
| `protocol` | <pre>Protocol</pre> | Protocol used by the SDK |

### connected

The `connected` property wraps the underlying protocol `connected` property.
See the associated documentation:
 - [Http.connected](/sdk/js/6/protocols/http/properties)
 - [WebSocket.connected](/sdk/js/6/protocols/websocket/properties)
 - [SocketIO.connected](/sdk/js/6/protocols/socketio/properties)

# Writable properties

| Property name        | Type     | Description          |
| -------------------- | -------- | ---------------------|
| `autoQueue` | <pre>boolean</pre> | If `true`, automatically queues all requests during offline mode |
| `autoReplay` | <pre>boolean</pre> | If `true`, automatically replays queued requests on a `reconnected` event |
| `autoResubscribe` | <pre>boolean</pre> | If `true`, automatically renews all subscriptions on a `reconnected` event |
| `jwt` | <pre>string</pre> | Authentication token |
| `offlineQueueLoader` | <pre>function</pre> | Called before dequeuing requests after exiting offline mode, to add items at the beginning of the offline queue  |
| `queueFilter` | <pre>function</pre> | Custom function called during offline mode to filter queued requests on-the-fly |
| `queueMaxSize` | <pre>number</pre>  | Number of maximum requests kept during offline mode|
| `queueTTL` | <pre>number</pre>  | Time a queued request is kept during offline mode, in milliseconds |
| `replayInterval` | <pre>number</pre>  | Delay between each replayed requests |
| `volatile` | <pre>object</pre> | Common volatile data, will be sent to all future requests |

### offlineQueueLoader

The `offlineQueueLoader` property must be set with a function of one of the following formats:

```js
Object[] offlineQueueLoader()

Promise<Object[]> offlineQueueLoader()
```

The returned (or resolved) array must contain objects, each with the following properties:

| Property | Type | Description |
|---|---|---|
| `query` | <pre>object</pre> | Object representing the request that is about to be sent to Kuzzle, following the [Kuzzle API](/core/1/api/essentials/query-syntax) format |
| `reject` | <pre>function</pre> | A [Promise.reject](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) function |
| `resolve` | <pre>function</pre> | A [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) function |

### queueFilter

The `queueFilter` property must be set with a function of the following form:

```js
boolean queueFilter(request)
```

The `request` argument is an object representing the request that is about to be sent to Kuzzle, following the [Kuzzle API](/core/1/api/essentials/query-syntax) format.

### queueMaxSize

This property defines the size of the offline buffer, which is a first-in first-out (FIFO) queue.

This means that if the `queueMaxSize` limit is reached, older requests are discarded to make room for newer requests.

If `queueMaxSize` is set to a number lower than, or equal to `0`, then an unlimited number of requests is kept in the offline buffer.
Note that doing so may lead to a crash due to memory saturation, if there are too many requests held in memory.

### queueTTL

If the `queueTTL` property is set to a number lower than, or equal to `0`, then requests never expire and are kept indefinitely.

### volatile

Multiple methods allow passing specific `volatile` data.

These `volatile` data will be merged with the global Kuzzle `volatile` object when sending the request, with the request specific `volatile` taking priority over the global ones.
