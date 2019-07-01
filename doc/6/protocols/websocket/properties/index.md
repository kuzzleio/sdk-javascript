---
code: false
type: page
title: Properties
description: Websocket class properties
order: 10
---

# Properties

| Property name        | Type     | Description          |
| -------------------- | -------- | ---------------------|
| `autoReconnect`      | <pre>boolean</pre> | Automatically reconnect after a connection loss    |
| `connected`  | <pre>boolean</pre>  | Returns `true` if the socket is open |
| `host`  | <pre>string</pre>  | Kuzzle server host |
| `reconnectionDelay`  | <pre>number</pre>  | Number of milliseconds between reconnection attempts         |
| `port`  | <pre>number</pre>  | Kuzzle server port |
| `ssl`  | <pre>boolean</pre>  | `true` if ssl is active |

::: info
Updates to `autoReconnect` and `reconnectionDelay` properties will only take effect on the next `connect` call.
:::