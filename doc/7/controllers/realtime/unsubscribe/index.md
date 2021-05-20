---
code: true
type: page
title: unsubscribe
description: Removes a subscription
---

# unsubscribe

Removes a subscription.

<br/>

```js
unsubscribe(roomId, [options]);
```

<br/>

| Arguments | Type              | Description          |
| --------- | ----------------- | -------------------- |
| `roomId`  | <pre>string</pre> | Subscription room ID |
| `options` | <pre>object</pre> | Query options        |

### options

Additional query options

| Option     | Type<br/>(default)           | Description                                                                                                           |
| ---------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>bool</pre><br/>(`true`) | Make this request queuable or not                                                                                     |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>       | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves if successfuly unsubscribed.

## Usage

<<< ./snippets/unsubscribe.js
