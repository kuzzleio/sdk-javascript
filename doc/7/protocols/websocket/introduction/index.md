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

### Cookie Authentication

Kuzzle does support cookie authentication, meaning that when you're making a request, you can instruct Kuzzle to store the token securely inside a cookie in your browser, instead of returning it in the response.
The support for cookie authentication can be enabled, using the [cookieAuth](/sdk/js/7/core-classes/kuzzle/constructor) option at the SDK initialization.

When you enable the [cookieAuth](/sdk/js/7/core-classes/kuzzle/constructor) option, it changes how the websocket protocol behave when you're sending requests that can modify the token stored in the cookie.

When such a request is sent, the Websocket Protocol will use the [HTTP Protocol](/sdk/js/7/protocols/http/introduction) instead, because cookies can only be set through HTTP Request in a browser, for every other requests the default behaviour is used and the request is sent through websocket.

On top of that, when a request that can modifies the stored token in the cookie is sent, the Websocket Protocol will disconnect itself from Kuzzle, send the request through HTTP, wait for the response then reconnect itself to Kuzzle.
Since cookie can only be sent during the Websocket Handshake process at the start of a new websocket connection, every requests having to modify the token stored in the cookie should be followed by a reconnection to ensure that Kuzzle is using the new updated token for the next requests.

Here is a list of controller's actions that are impacted by those changes in the Websocket Protocol behaviour when [cookieAuth](/sdk/js/7/core-classes/kuzzle/constructor) is enabled:
- [auth:login](/sdk/js/7/controllers/auth/login)
- [auth:logout](/sdk/js/7/controllers/auth/logout)
- [auth:refreshToken](/sdk/js/7/controllers/auth/refreshToken)

::: warning
All the behaviours described above are handled by the SDK, you do not have to implement this yourself.
:::