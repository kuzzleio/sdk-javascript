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

Kuzzle supports cookie authentications, meaning that when using this SDK in a browser, you can ask Kuzzle to return authentication tokens in secure cookies, handled by browsers. This means that, when using that option, browser clients will never have access to said tokens, preventing a few common attacks.
The support for cookie authentication can be enabled, using the [cookieAuth](/sdk/js/7/core-classes/kuzzle/constructor) option at the SDK initialization.

When you enable the [cookieAuth](/sdk/js/7/core-classes/kuzzle/constructor) option, it changes the way the websocket protocol behaves when you're sending requests that should otherwise return authentication tokens in their response payload.

When a request susceptible of changing an authentication cookie is about to be sent, the WebSocket Protocol send it using the [HTTP Protocol](/sdk/js/7/protocols/http/introduction) instead, to allow browsers to apply the received cookie. 

If a new cookie is received from Kuzzle that way, the WebSocket connection is automatically renewed.

::: info
Cookies can only be applied to WebSocket connections during the connection handshake (upgrade from HTTP to WebSocket), and they stay valid as long as the connection is active, and as long as the cookie hasn't expired. 
:::

Here is a list of controller's actions that are affected by this behavior, when the [cookieAuth](/sdk/js/7/core-classes/kuzzle/constructor) option is enabled:
- [auth:login](/sdk/js/7/controllers/auth/login)
- [auth:logout](/sdk/js/7/controllers/auth/logout)
- [auth:refreshToken](/sdk/js/7/controllers/auth/refresh-token)

::: info
The behaviors described above are automatically handled by the SDK, you do not need to implement this yourself.
:::