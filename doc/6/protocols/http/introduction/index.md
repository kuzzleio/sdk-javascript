---
code: false
type: page
title: Introduction
description: Http protocol implementation
order: 0
---

# Http

The Http protocol can be used by an instance of the SDK to communicate with your Kuzzle server.

::: info
This protocol does not allow to use the [real-time notifications](/sdk/js/6/essentials/realtime-notifications/).

If you need real-time features, then you have to use either [WebSocket](/sdk/js/6/protocols/websocket) or [SocketIO](/sdk/js/6/protocols/socketio) protocols.
:::

## About HTTP routing

<SinceBadge version="6.2.0"/>

This protocol needs to build routes from the name of the controller and the action used. These routes are made available by Kuzzle via the [server:publicApi](/core/1/api/controllers/server/public-api) method or the [server:info](/core/1/api/controllers/server/info) method.  


<SinceBadge version="Kuzzle 1.9.0"/>
For confidentiality reasons, it is preferable to expose only the `server:publicApi` route to the anonymous user.  
If this route is not available, the SDK will use the static definition of API routes that does not include routes developed in plugins.  

Finally, it is also possible to manually define the routes to the actions of its plugins using the `customRoutes` option with the [Http protocol constructor](/sdk/js/6/protocols/http/constructor).
