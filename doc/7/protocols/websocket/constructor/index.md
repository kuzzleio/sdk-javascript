---
code: true
type: page
title: constructor
description: Creates a new WebSocket protocol
order: 50
---

# Constructor

This constructor creates a new WebSocket connection, using the specified options.

## Arguments

```js
WebSocket(host, [options]);
```

<br/>

| Argument  | Type              | Description                  |
| --------- | ----------------- | ---------------------------- |
| `host`    | <pre>string</pre> | Kuzzle server hostname or IP |
| `options` | <pre>object</pre> | WebSocket connection options |

### options

WebSocket protocol connection options.

| Property            | Type<br/>(default)               | Description                                                                                  |
| ------------------- | -------------------------------- | -------------------------------------------------------------------------------------------- |
| `autoReconnect`     | <pre>boolean</pre><br/>(`true`)  | Automatically reconnect to kuzzle after a `disconnected` event                               |
| `headers`           | <pre>object</pre>(`{}`)          | Connection custom HTTP headers (e.g. origin, subprotocols, ...)<br/>**(Not supported by browsers)** |
| `pingInterval` | <pre>number</pre><br/>(`10000`)   | Number of milliseconds between two pings                                         |
| `port`              | <pre>number</pre><br/>(`7512`)   | Kuzzle server port                                                                           |
| `reconnectionDelay` | <pre>number</pre><br/>(`1000`)   | Number of milliseconds between reconnection attempts                                         |
| `sslConnection`     | <pre>boolean</pre><br/>(`false`) | Use SSL to connect to Kuzzle server   <DeprecatedBadge version="7.4.0"/>   |
| `ssl`     | <pre>boolean</pre><br/>(`false`) | Use SSL to connect to Kuzzle server. Defaults to `true` for ports 443 and 7443.   |

## Return

A `WebSocket` protocol instance.

## Usage

<<< ./snippets/constructor.js
