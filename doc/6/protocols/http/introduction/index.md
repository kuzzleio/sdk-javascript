---
code: false
type: page
title: Introduction
description: Http protocol implementation
order: 0
---

# Http

The Http protocol can be used by an instance of the SDK to communicate with your Kuzzle server.

:::info
This protocol does not allow to use the [real-time notifications](/sdk/js/6/essentials/realtime-notifications/).

If you need real-time features, then you have to use either [WebSocket](/sdk/js/6/protocols/websocket) or [SocketIO](/sdk/js/6/protocols/socketio) protocols.
:::

<SinceBadge version="Kuzzle 1.9.0" />

::: warning
This protocol needs [server:publicApi](/core/1/api/controllers/server/public-api) to build URLs for requests to the Kuzzle API.
You must allow this route for the anonymous user otherwise the plugin routes will not be available
:::
