---
code: true
type: page
title: mexecute
---

# mexecute

Allows the execution of multiple commands or 'actions' in a single step.

It creates a Redis **transaction** block and **executes** it immediately, all actions will be executed sequentially and as a single atomic and isolated operation.

[[_Redis documentation_]](https://redis.io/topics/transactions)

::: warning
Only already valid actions of the memoryStorage controller can be executed using **mexecute**.
:::

## Arguments

```js
mexecute(actions, [options]);
```

<br/>

| Arguments | Type                | Description                    |
| --------- | ------------------- | ------------------------------ |
| `actions` | <pre>object[]</pre> | List of actions to execute     |
| `options` | <pre>object</pre>   | Optional query arguments       |

### actions

The `actions` argument is an array of objects. Each object describes an action to be executed, using the following properties:

| Property | Type              | Description |
| -------- | ----------------- | ----------- |
| `action` | <pre>string</pre> | Action name |
| `args`   | <pre>object</pre> | Arguments   |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Returns an array of error & result pairs for each executed action, in order.

## Usage

<<< ./snippets/mexecute.js
