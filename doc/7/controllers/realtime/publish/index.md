---
code: true
type: page
title: publish
description: Publish a real-time message
---

# publish

Sends a real-time message to Kuzzle. The message will be dispatched to all clients with subscriptions matching the index, the collection and the message content.

The index and collection are indicative and serve only to distinguish the rooms. They are not required to exist in the database

**Note:** real-time messages are not persisted in the database.

<br/>

```js
publish(index, collection, message, [options]);
```

<br/>

| Arguments    | Type              | Description     |
| ------------ | ----------------- | --------------- |
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `message`    | <pre>object</pre> | Message to send |
| `options`    | <pre>object</pre> | Query options   |

### options

Additional query options

| Option     | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | Make this request queuable or not                                                                                     |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)        | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A boolean indicating if the message was successfully published.

## Usage

<<< ./snippets/publish.js
