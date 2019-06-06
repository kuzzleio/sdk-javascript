---
code: true
type: page
title: unsubscribe
description: Removes a subscription
---

# unsubscribe

Removes a subscription.

<br/>

```javascript
unsubscribe(roomId, [options]);
```

<br/>

| Arguments | Type              | Description          |
| --------- | ----------------- | -------------------- |
| `roomId`  | <pre>string</pre> | Subscription room ID |
| `options` | <pre>object</pre> | Query options        |

### options

Additional query options

| Option     | Type<br/>(default)           | Description                       |
| ---------- | ---------------------------- | --------------------------------- |
| `queuable` | <pre>bool</pre><br/>(`true`) | Make this request queuable or not |

## Resolves

Resolves if successfuly unsubscribed.

## Usage

<<< ./snippets/unsubscribe.js
