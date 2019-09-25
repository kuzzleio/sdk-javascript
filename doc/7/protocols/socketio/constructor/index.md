---
code: true
type: page
title: constructor
description: Creates a new SocketIO protocol
order: 50
---

# Constructor

Use this constructor to create a new instance of the `SocketIO` protocol with specific options.

## Arguments

```js
SocketIO(host, [options]);
```

<br/>

| Argument  | Type              | Description                  |
| --------- | ----------------- | ---------------------------- |
| `host`    | <pre>string</pre> | Kuzzle server hostname or IP |
| `options` | <pre>object</pre> | SocketIO connection options  |

### options

SocketIO protocol connection options.

| Property            | Type<br/>(default)               | Description                                                    |
| ------------------- | -------------------------------- | -------------------------------------------------------------- |
| `port`              | <pre>number</pre><br/>(`7512`)   | Kuzzle server port                                             |
| `sslConnection`     | <pre>boolean</pre><br/>(`false`) | Use SSL to connect to Kuzzle server                            |
| `autoReconnect`     | <pre>boolean</pre><br/>(`true`)  | Automatically reconnect to kuzzle after a `disconnected` event |
| `reconnectionDelay` | <pre>number</pre><br/>(`1000`)   | Number of milliseconds between reconnection attempts           |

## Return

A `SocketIO` protocol instance.

## Usage

<<< ./snippets/constructor.js
