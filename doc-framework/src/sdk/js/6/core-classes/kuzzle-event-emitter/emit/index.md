---
code: true
type: page
title: emit
description: Emits an event
---

# emit

Emits an event with the specified payload.

## Arguments

```js
emit(eventName, ...payload);
```

<br/>

| Argument    | Type              | Description                       |
| ----------- | ----------------- | --------------------------------- |
| `eventName` | <pre>string</pre> | The name of the event             |
| `payload`   | <pre>any</pre>    | Payload(s) to send with the event |

## Return

The `KuzzleEventEmitter` instance.

## Usage

<<< ./snippets/emit.js
