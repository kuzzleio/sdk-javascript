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

```javascript
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

| Option     | Type<br/>(default)              | Description                       |
| ---------- | ------------------------------- | --------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | Make this request queuable or not |

## Resolves

A boolean indicating if the message was successfully published.

## Usage

<<< ./snippets/publish.js
