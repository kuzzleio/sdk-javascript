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
| `timeout`  | <pre>number</pre><br/>          | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves to a number representing active connections using the same provided subscription room.

## Usage

<<< ./snippets/count.js
