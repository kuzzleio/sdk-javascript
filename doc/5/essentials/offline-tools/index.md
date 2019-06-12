---
code: false
type: page
title: Offline Tools
order: 400
---

# Offline Tools

When using an unstable network connection, an application must maintain a normal behavior when it is disconnected. Our goal is to provide the right toolkit to handle such situations.

---

## Handling a Network Disconnect

There are two ways to handle a network disconnect:

- Automatically reconnect to Kuzzle when possible, and enter _offline mode_ in the meantime. This is the default behavior.
- Stop all further communication with Kuzzle and invalidate the current instance and all its children. The application will have to manually reconnect once the network is available. To do so, simply set the `autoReconnect` option to `false` when creating the SDK instance.

_Offline mode_ refers to the time between a `disconnected` and a `reconnected` event (see [Events](/sdk/js/5/essentials/events)).

---

## Subscriptions

A subscription opens a permanent pipe between the client and Kuzzle. Whenever a real-time message or a modified document matches a subscription filter, a notification is sent by Kuzzle to the client (for instance, see the [Collection.subscribe](/sdk/js/5/core-classes/collection/subscribe) method).

While in offline mode, the Kuzzle SDK client maintains all subscriptions configurations and, by default, when Kuzzle SDK client reconnects, all subscriptions are renewed. This behavior can be changed by setting the `autoResubscribe` to `false`, in which case, each subscription will have to be renewed manually using the `Room.renew` method.

---

## API Requests

While in offline mode, API requests can be queued, and then executed once the network connection has been reestablished.
By default, there is no request queuing.

- Queue all requests automatically when going offline by setting the `autoQueue` option to `true` (see [Kuzzle SDK constructor](/sdk/js/5/core-classes/kuzzle))
- Start and stop queuing manually, by using the [startQueuing](/sdk/js/5/core-classes/kuzzle/start-queuing) and [stopQueuing](/sdk/js/5/core-classes/kuzzle/stop-queuing) methods

The queue itself can be configured using the `queueTTL` and `queueMaxSize` options.

---

## Filtering Requests to be Queued

By default, when queuing is first activated, all requests are queued.

However, you can choose to omit certain request by using the [`queueFilter`](/sdk/js/5/core-classes/kuzzle#properties) property. This property can be set to a function that accepts the request as an input value and returns a boolean result which indicates whether or not the request should be queud.

Additionally, almost all request methods accept a `queuable` option, which when set to `false`, will cause the request to be discarded if the Kuzzle SDK is disconnected. This option overrides the `queueFilter` property.

---

## Handling Network Reconnect

<div class="alert alert-warning">
Setting <code>autoReplay</code> to <code>true</code> when using user authentication should generally be avoided.<br/>
When leaving offline-mode, the JWT validity is verified. If it has expired, the token will be removed and a <code>tokenExpired</code> event will be triggered.<br/>
If <code>autoReplay</code> is set, then all pending requests will be automatically played as an anonymous user.
</div>

Once a `reconnected` event is fired, you may replay the content of the queue with the `playQueue` method. Or you can let the Kuzzle SDK replay it automatically upon reconnection by setting the `autoReplay` option to `true`.

Requests are sent to Kuzzle with a `replayInterval` delay between each call.

Any request made while the client is processing the queue will be delayed until the queue is empty. This ensures that all requests are played in the right order.

---

## Taking Control of the Offline Queue

You can be notified about what's going on in the offline queue, by using the [`offlineQueuePush`](/sdk/js/5/essentials/events) and the [`offlineQueuePop`](/sdk/js/5/essentials/events) events.

The `offlineQueuePush` event is fired whenever a request is queued. It will emit an object containing a `query` property, describing the queued request, and an optional `cb` property containing the corresponding callback, if any.

The `offlineQueuePop` event is fired whenever a request has been removed from the queue, either because the queue limits have been reached, or because the request has been replayed. It provides the removed request to its listeners.

The `offlineQueueLoader` property of the Kuzzle SDK instance loads requests to the queue, **before any previously queued request**. It is invoked every time the Kuzzle SDK starts dequeuing requests.
This property must be set with a function that returns an array of objects with the following accessible properties:

- a `query` property, containing the request to be replayed
- an optional `cb` property pointing to the callback to invoke after the completion of the request

Finally, if the provided methods don't give you enough control over the offline queue, you can access and edit the queue directly using the `offlineQueue` property.

---

## Automatic Offline-Mode

You can set the `offlineMode` option to `auto` when instantiating the [Kuzzle SDK instance](/sdk/js/5/core-classes/kuzzle). This sets the offline mode configuration to the following presets:

- `autoReconnect` = `true`
- `autoQueue` = `true`
- `autoReplay` = `true`
- `autoResubscribe` = `true`
