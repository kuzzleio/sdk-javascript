---
code: false
type: page
title: Introduction
description: Websocket protocol implementation
order: 0
---

# WebSocket

Inherits from: [KuzzleEventEmitter](/sdk/js/7/core-classes/kuzzle-event-emitter)

The WebSocket protocol can be used by an instance of the SDK to communicate with your Kuzzle server.

This protocol allows you to use all the features of Kuzzle, including [real-time notifications](/sdk/js/7/essentials/realtime-notifications).

### Ping / Pong keep-alive

Though Kuzzle's WebSocket server is fully compliant with the [RFC6455](https://tools.ietf.org/html/rfc6455#section-5.5.2), meaning (among other things) that Kuzzle will respond to PING packets with standard PONG ones, an additional PING request has been added in the protocol's application layer.

This application-level PING has been especially added for web browsers, which don't allow sending PING packets. This can be troublesome if a web application needs to know if a connection has been severed, or if Kuzzle is configured to be in passive mode (i.e. it won't send PING requests by itself, and will close sockets if they are idle for too long).

When run in a browser, our Javascript SDK uses that feature for its keep-alive mechanism: a message will periodically be sent to Kuzzle in the form `"{"p":1}"` through websocket.
That message will call a response from Kuzzle in the form `"{"p":2}"` for the SDK to keep the connection alive.

