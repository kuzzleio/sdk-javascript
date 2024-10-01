---
code: true
type: page
title: upsert
description: Applies partial changes to a document. If the document doesn't already exist, a new document is created.
---

# upsert

<SinceBadge version="Kuzzle 2.8.0"/>
<SinceBadge version="7.5.0" />

Applies partial changes to a document. If the document doesn't already exist, a new document is created.


```js
upsert(index, collection, id, changes, [options]);
```

| Argument     | Type              | Description                               |
| ------------ | ----------------- | ----------------------------------------- |
| `index`      | <pre>string</pre> | Index name                                |
| `collection` | <pre>string</pre> | Collection name                           |
| `id`         | <pre>string</pre> | Document ID                               |
| `changes`    | <pre>object</pre> | Partial content of the document to update |

### Options

Additional query options

| Options           | Type<br/>(default)               | Description                                                                                                           |
| ----------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `default`        | <pre>object</pre><br/>(`{}`)     | Fields to add to the document if it gets created                                                                      |
| `refresh`         | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                    |
| `retryOnConflict` | <pre>int</pre><br/>(`10`)        | The number of times the database layer should retry in case of version conflict                                       |
| `silent`          | <pre>boolean</pre><br/>(`false`) | If `true`, then Kuzzle will not generate notifications <SinceBadge version="7.5.3"/>                                  |
| `source`          | <pre>boolean</pre><br/>(`false`) | If `true`, returns the updated document inside the response                                                             |
| `queuable`        | <pre>boolean</pre><br/>(`true`)  | If `true`, queues the request during downtime, until connected to Kuzzle again             |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)         | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Resolves to an object containing the document update result.

## Usage

<<< ./snippets/upsert.js
