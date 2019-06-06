---
code: true
type: page
title: Introduction
description: Kuzzle object
order: 0
---

# Kuzzle

Inherits from: [KuzzleEventEmitter](/sdk/js/6/kuzzle-event-emitter).

The Kuzzle class is the main class of the SDK.  
Once instantiated, it represents a connection to your Kuzzle server.

It gives access to the different features of the SDKs:

- access to the available controllers
- [SDK events](/sdk/cpp/1/events) handling
- resilience to connection loss
- network request queue management

## Network protocol

Each instance of the class communicates with the Kuzzle server through a class representing a network protocol implementation.

The following protocols are available in the SDK JS 6:

- [WebSocket](/sdk/js/6/websocket)
- [Http](/sdk/js/6/http)
- [SocketIO](/sdk/js/6/socketio)

## Volatile data

You can tell the Kuzzle SDK to attach a set of "volatile" data to each request. You can set it as an object contained in the `volatile` field of the Kuzzle constructor. The response to a request containing volatile data will contain the same data in its `volatile` field. This can be useful, for example, in real-time notifications for [user join/leave notifications](/core/1/api/essentials/volatile-data/) to provide additional informations about the client who sent the request.

Note that you can also set volatile data on a per-request basis (on requests that accept a `volatile` field in their `options` argument). In this case, per-request volatile data will be merged with the global `volatile` object set in the constructor. Per-request fields will override global ones.

## Properties

Available properties.

| Property name        | Type                | Description                                                                                                                       | Writable? |
| -------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| `autoQueue`          | <pre>boolean</pre>  | Automatically queue all requests during offline mode                                                                              |    Yes    |
| `autoReplay`         | <pre>boolean</pre>  | Automatically replay queued requests on a `reconnected` event                                                                     |    Yes    |
| `autoResubscribe`    | <pre>boolean</pre>  | Automatically renew all subscriptions on a `reconnected` event                                                                    |    Yes    |
| `jwt`                | <pre>string</pre>   | Token used in requests for authentication                                                                                         |    Yes    |
| `offlineQueue`       | <pre>object[]</pre> | Contains the queued requests during offline mode                                                                                  |    No     |
| `offlineQueueLoader` | <pre>function</pre> | Called before dequeuing requests after exiting offline mode,</br> to add items at the beginning of the offline queue              |    Yes    |
| `protocol`           | <pre>Protocol</pre> | Protocol used by the SDK                                                                                                          |    No     |
| `queueFilter`        | <pre>function</pre> | Called during offline mode. </br>Takes a request object as arguments and returns a boolean, indicating if a request can be queued |    Yes    |
| `queueMaxSize`       | <pre>number</pre>   | Number of maximum requests kept during offline mode                                                                               |    Yes    |
| `queueTTL`           | <pre>number</pre>   | Time a queued request is kept during offline mode, in milliseconds                                                                |    Yes    |
| `replayInterval`     | <pre>number</pre>   | Delay between each replayed requests                                                                                              |    Yes    |
| `volatile`           | <pre>object</pre>   | Common volatile data, will be sent to all future requests                                                                         |    Yes    |

### offlineQueueLoader

The `offlineQueueLoader` property must be set with a function of one of the following formats:

```js
Object[] offlineQueueLoader()

Promise<Object[]> offlineQueueLoader()
```

The returned (or resolved) array must contain objects, each with the following properties:

| Property  | Type                | Description                                                                                                                                |
| --------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `query`   | <pre>object</pre>   | Object representing the request that is about to be sent to Kuzzle, following the [Kuzzle API](/core/1/api/essentials/query-syntax) format |
| `reject`  | <pre>function</pre> | A [Promise.reject](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) function               |
| `resolve` | <pre>function</pre> | A [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) function             |

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
