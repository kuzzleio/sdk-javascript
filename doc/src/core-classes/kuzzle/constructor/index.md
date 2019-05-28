---
code: true
type: page
title: Constructor
description: Creates a new Kuzzle object connected to the backend
order: 50
---

# Constructor

Use this constructor to create a new instance of the SDK.  
Each instance represent a different connection to a Kuzzle server with specific options.

## Arguments

```javascript
Kuzzle(protocol, [options]);
```

<br/>

| Argument   | Type                | Description                       |
| ---------- | ------------------- | --------------------------------- |
| `protocol` | <pre>Protocol</pre> | Protocol used by the SDK instance |
| `options`  | <pre>object</pre>   | Kuzzle object configuration       |

### protocol

The protocol used to connect to the Kuzzle instance.  
It can be one of the following available protocols:

- [WebSocket](/sdk/js/6/websocket)
- [Http](/sdk/js/6/http)
- [SocketIO](/sdk/js/6/socketio)

### options

Kuzzle SDK instance options.

| Property          | Type<br/>(default)               | Description                                                        |
| ----------------- | -------------------------------- | ------------------------------------------------------------------ |
| `autoQueue`       | <pre>boolean</pre><br/>(`false`) | Automatically queue all requests during offline mode               |
| `autoReplay`      | <pre>boolean</pre><br/>(`false`) | Automatically replay queued requests on a `reconnected` event      |
| `autoResubscribe` | <pre>boolean</pre><br/>(`true`)  | Automatically renew all subscriptions on a `reconnected` event     |
| `eventTimeout`    | <pre>number</pre><br/>(`200`)    | Time (in ms) during which a similar event is ignored               |
| `offlineMode`     | <pre>string</pre><br/>(`manual`) | Offline mode configuration. Can be `manual` or `auto`              |
| `queueTTL`        | <pre>number</pre><br/>(`120000`) | Time a queued request is kept during offline mode, in milliseconds |
| `queueMaxSize`    | <pre>number</pre><br/>(`500`)    | Number of maximum requests kept during offline mode                |
| `replayInterval`  | <pre>number</pre><br/>(`10`)     | Delay between each replayed requests, in milliseconds              |
| `volatile`        | <pre>object</pre><br/>(`{}`)     | Common volatile data, will be sent to all future requests          |

## Return

The `Kuzzle` SDK instance.

## Usage

<<< ./snippets/constructor.js
