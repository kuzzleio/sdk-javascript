---
code: false
type: page
title: Offline Tools
description: Tools to handle the loss of connection to the Kuzzle server
order: 400
---

# Offline tools

The Kuzzle SDK provides a set of properties that helps your application to be resilient to the loss of network connection
during its lifespan.

## Authentication after reconnection

When the SDK reconnect, the authentication token may not be valid anymore.

It's possible to set the [authenticator](/sdk/js/7/core-classes/kuzzle/properties#authenticator) function to allows the SDK to re-authenticate after a successful reconnection.

<details><summary>Example to automatically re-authenticate on reconnection</summary>

```js
const { Kuzzle, WebSocket } = require('kuzzle');

const kuzzle = new Kuzzle(new WebSocket('localhost'), { autoResubscribe: true });

kuzzle.authenticator = async () => {
  await kuzzle.auth.login('local', { username: 'test', password: 'test' });
};

await kuzzle.connect();
await kuzzle.authenticate();

await kuzzle.realtime.subscribe('test', 'test', {}, () => {
  console.log('Received');
});
```

</details>

:::info
Note that the offline tools will use the current authentication token to replay the requests in the queue.
:::

If the token cannot be checked because Kuzzle does not answer (the socket is lost again, the node is shutting down, the check times out), the SDK keeps the session as it is: it does not call the `authenticator`, does not emit `reconnectionError` and does not disconnect. The next reconnection checks the token again.

## Rolling restart of a Kuzzle cluster

A Kuzzle node that stops rejects new requests with a `shutting_down` error (`api.process.shutting_down` or `network.entrypoint.shutting_down`, status `503`) until its process exits. These requests have not been executed.

When it receives such an error, the SDK:

- with the WebSocket protocol, closes the socket right away and reconnects (with `autoReconnect`), most likely to another node of the cluster;
- sends the rejected request again once it has reached another node, up to 3 times, unless the request was sent with the `queuable: false` option. If no node is reached within 30 seconds, the request is rejected with the original error.

Reconnection attempts wait a random delay between half the `reconnectionDelay` and the full delay, so that the clients of a stopped node do not all reconnect at the same instant.

## Contructor options and properties

These properties can be set in the `options` object when [instantiating a new SDK](/sdk/js/7/core-classes/kuzzle/constructor#arguments).

Some of them are also [writable properties](/sdk/js/7/core-classes/kuzzle/properties) available after SDK instantiation.

### autoQueue

A writable `boolean` telling the SDK whether to automatically queue requests during the `offline` state or not.

Default value: `false`

### autoReconnect

A writable `boolean` telling the SDK whether to automatically reconnect or not to Kuzzle after a connection loss.

Default value: *Depends on the Protocol*

### autoReplay

A writable `boolean` telling the SDK whether to automatically send or not the requests in the `offlineQueue` on a
`reconnected` event.

Default value: `false`

### autoResubscribe

A writable `boolean` telling the SDK whether to automatically renew or not all subscriptions on a reconnected event.

Default value: `true`

### offlineQueue

A read-only `Array` containing the requests queued while the SDK is in the `offline` state (it behaves like a FIFO queue).

### offlineQueueLoader

A writable `Function` called by the SDK before playing the requests in the `offlineQueue`. This function takes no arguments
and returns an array of `Request` that are added on top of the `offlineQueue`. Use it to inject new requests to be played
before the queue.

### queueFilter

A writable `Function` called by the SDK each time a `Request` need to be queued. The `Request` is passed as the only argument
to the function and is queued only if the function returns `true`. Use it to define which requests are allowed to be queued.

### queueMaxSize

A writable `number` defining the maximun size of the `offlineQueue`.

Default value: `500`

### queueTTL

A writable `number` defining the time in milliseconds a queued request is kept in the `offlineQueue`.  

Setting this parameter to `0` disables this behavior, and prevents the SDK from expiring queued requests.

Default value: `120000`

### reconnectionDelay

A read-only `number` specifying the maximum time in milliseconds between different reconnection attempts. Each attempt waits a random delay between half this value and this value.

Default value: *Depends on the Protocol*

### reconnectionError

Emitted when the SDK reconnect to Kuzzle and Kuzzle reports that the authentication token is not valid anymore, and it cannot be renewed with the [authenticator](/sdk/js/7/core-classes/kuzzle/properties#authenticator) function. The SDK is then disconnected.

It is not emitted when the token could not be checked because Kuzzle did not answer: the session is kept and checked again on the next reconnection.

## Methods

### [flushQueue()](/sdk/js/7/core-classes/kuzzle/flush-queue)

Empties the `offlineQueue` without sending the requests to Kuzzle.

### [playQueue()](/sdk/js/7/core-classes/kuzzle/play-queue)

Sends to Kuzzle all the requests in the `offlineQueue`. Works only if the SDK is not in a `offline` state, and if the
`autoReplay` option is set to false.

### [startQueuing()](/sdk/js/7/core-classes/kuzzle/start-queuing)

Starts queuing requests when in `offline` state. Requests will be put in the `offlineQueue` array instead of being discarded, until `stopQueuing` is called.
Works only in `offline` state when the `autoQueue` option is set to `false`. Call `playQueue` to send to Kuzzle the
requests in the queue, once the SDK state passes to `online`. Call `flushQueue` to empty the queue without sending the requests.

### [stopQueuing()](/sdk/js/7/core-classes/kuzzle/stop-queuing)

Stop queuing the requests. Requests will no more be put in the `offlineQueue`, they will be discarded.
Works only in the `offline` state, and if the `autoQueue` option is set to `false`.
