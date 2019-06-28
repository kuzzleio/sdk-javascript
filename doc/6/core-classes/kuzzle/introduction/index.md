---
code: false
type: page
title: Introduction
description: Kuzzle object
order: 0
---

# Kuzzle

Inherits from: [KuzzleEventEmitter](/sdk/js/6/core-classes/kuzzle-event-emitter).

The Kuzzle class is the main class of the SDK.
Once instantiated, it represents a connection to your Kuzzle server.

It gives access to the different features of the SDKs:

- access to the available controllers
- [SDK events](/sdk/cpp/1/essentials/events) handling
- resilience to connection loss
- network request queue management

## Network protocol

Each instance of the class communicates with the Kuzzle server through a class representing a network protocol implementation.

The following protocols are available in the SDK JS 6:

- [WebSocket](/sdk/js/6/protocols/websocket)
- [Http](/sdk/js/6/protocols/http)
- [SocketIO](/sdk/js/6/protocols/socketio)

## Volatile data

You can tell the Kuzzle SDK to attach a set of "volatile" data to each request. You can set it as an object contained in the `volatile` field of the Kuzzle constructor. The response to a request containing volatile data will contain the same data in its `volatile` field. This can be useful, for example, in real-time notifications for [user join/leave notifications](/core/1/api/essentials/volatile-data/) to provide additional informations about the client who sent the request.

Note that you can also set volatile data on a per-request basis (on requests that accept a `volatile` field in their `options` argument). In this case, per-request volatile data will be merged with the global `volatile` object set in the constructor. Per-request fields will override global ones.