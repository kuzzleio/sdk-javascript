---
code: false
type: page
title: Kuzzle
description: Entry point and main class for the entire SDK
order: 100
---

# Constructor

This is the main entry point to communicate with Kuzzle. Every other object inherits properties from the `Kuzzle` object.

---

## Kuzzle(host, [options], [callback])

| Arguments  | Type        | Description                                                         |
| ---------- | ----------- | ------------------------------------------------------------------- |
| `host`     | string      | The server name (or the IP address) of a Kuzzle server installation |
| `options`  | JSON object | Optional Kuzzle connection configuration                            |
| `callback` | function    | Optional callback                                                   |

---

## Options

| Option              | Type        | Description                                                        | Default  |
| ------------------- | ----------- | ------------------------------------------------------------------ | -------- |
| `autoQueue`         | boolean     | Automatically queue all requests during offline mode               | `false`  |
| `autoReconnect`     | boolean     | Automatically reconnect after a connection loss                    | `true`   |
| `autoReplay`        | boolean     | Automatically replay queued requests on a `reconnected` event      | `false`  |
| `autoResubscribe`   | boolean     | Automatically renew all subscriptions on a `reconnected` event     | `true`   |
| `connect`           | string      | Manually or automatically connect to the Kuzzle instance           | `auto`   |
| `defaultIndex`      | string      | Set the default index to use                                       |          |
| `headers`           | JSON object | Common headers for all sent documents                              |          |
| `volatile`          | JSON object | Common volatile data, will be sent to all future requests          |          |
| `offlineMode`       | string      | Offline mode configuration                                         | `manual` |
| `port`              | integer     | Kuzzle network port                                                | 7512     |
| `queueTTL`          | integer     | Time a queued request is kept during offline mode, in milliseconds | `120000` |
| `queueMaxSize`      | integer     | Number of maximum requests kept during offline mode                | `500`    |
| `replayInterval`    | integer     | Delay between each replayed requests, in milliseconds              | `10`     |
| `reconnectionDelay` | integer     | number of milliseconds between reconnection attempts               | `1000`   |
| `sslConnection`     | boolean     | Switch Kuzzle connection to SSL mode                               | `false`  |

**Notes:**

- the `offlineMode` option only accepts the `manual` and `auto` values

---

## Properties

| Property name        | Type        | Description                                                                                                                  | Writable? |
| -------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- | :-------: |
| `autoQueue`          | boolean     | Automatically queue all requests during offline mode                                                                         |    Yes    |
| `autoReconnect`      | boolean     | Automatically reconnect after a connection loss                                                                              |    No     |
| `autoReplay`         | boolean     | Automatically replay queued requests on a `reconnected` event                                                                |    Yes    |
| `autoResubscribe`    | boolean     | Automatically renew all subscriptions on a `reconnected` event                                                               |    No     |
| `defaultIndex`       | string      | Kuzzle's default index to use                                                                                                |    Yes    |
| `headers`            | JSON object | Common headers for all sent documents.                                                                                       |    Yes    |
| `host`               | string      | Target Kuzzle host name/address                                                                                              |    No     |
| `jwtToken`           | string      | Token used in requests for authentication.                                                                                   |    Yes    |
| `offlineQueue`       | JSON object | Contains the queued requests during offline mode                                                                             |    No     |
| `offlineQueueLoader` | function    | Called before dequeuing requests after exiting offline mode, to add items at the beginning of the offline queue              |    Yes    |
| `port`               | integer     | Kuzzle network port                                                                                                          |    No     |
| `queueFilter`        | function    | Called during offline mode. Takes a request object as arguments and returns a boolean, indicating if a request can be queued |    Yes    |
| `queueMaxSize`       | integer     | Number of maximum requests kept during offline mode                                                                          |    Yes    |
| `queueTTL`           | integer     | Time a queued request is kept during offline mode, in milliseconds                                                           |    Yes    |
| `replayInterval`     | integer     | Delay between each replayed requests                                                                                         |    Yes    |
| `reconnectionDelay`  | integer     | Number of milliseconds between reconnection attempts                                                                         |    No     |
| `sslConnection`      | boolean     | Connect to Kuzzle using SSL                                                                                                  |    No     |
| `volatile`           | JSON object | Common volatile data, will be sent to all future requests                                                                    |    Yes    |

**Notes:**

- if `connect` is set to `manual`, the `connect` method will have to be called manually
- the kuzzle instance will automatically queue all requests, and play them automatically once a first connection is established, regardless of the `connect` or offline mode option values.
- multiple methods allow passing specific `volatile` data. These `volatile` data will be merged with the global Kuzzle `volatile` object when sending the request, with the request specific `volatile` taking priority over the global ones.
- the `queueFilter` property is a function taking a JSON object as an argument. This object is the request sent to Kuzzle, following the [Kuzzle API](/core/1/api/essentials/query-syntax) format
- if `queueTTL` is set to `0`, requests are kept indefinitely
- The offline buffer acts like a first-in first-out (FIFO) queue, meaning that if the `queueMaxSize` limit is reached, older requests are discarded to make room for new requests
- if `queueMaxSize` is set to `0`, an unlimited number of requests is kept until the buffer is flushed
- the `offlineQueueLoader` must be set with a function, taking no argument, and returning an array of objects containing a `query` member with a Kuzzle query to be replayed, and an optional `cb` member with the corresponding callback to invoke with the query result
- updates to `host`, `port`, `autoReconnect`, `reconnectionDelay` and `sslConnection` properties will only take effect on next `connect` call

---

## Callback response

If the connection succeeds, resolves to the `Kuzzle` object itself.
If the `connect` option is set to `manual`, the callback will be called after the `connect` method is resolved.

## Usage

<<< ./snippets/constructor-1.js
