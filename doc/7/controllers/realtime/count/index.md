---
code: true
type: page
title: count
description: Count subscribers for a subscription room
---

# count

Returns the number of other connections sharing the same subscription.

## Arguments

```js
count(roomId, [options]);
```

<br/>

| Arguments | Type              | Description          |
| --------- | ----------------- | -------------------- |
| `roomId`  | <pre>string</pre> | Subscription room ID |
| `options` | <pre>object</pre> | Query options        |

### options

Additional query options

| Option     | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | Make this request queuable or not                                                                                     |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)        | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Resolves to a number representing active connections using the same provided subscription room.

## Usage

<<< ./snippets/count.js
