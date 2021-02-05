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

<SinceBadge version="2.10.0"/>
:::info
We needed the client to be able to ping Kuzzle to have a keep-alive system.
Through the browser, that was not possible to send real formatted pings websocket frames since there is no API implemented for that unlike the one of Node.
We needed something higher level.
That is the reason why when you are using the SDK Javascript, the ping/pong between Kuzzle and your client is a custom message interpreter.
:::