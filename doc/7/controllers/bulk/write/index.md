---
code: true
type: page
title: write
description: Creates or replaces a document directly into the storage engine.
---

# write

<SinceBadge version="6.2.0" />

<SinceBadge version="Kuzzle 1.8.0" />

Creates or replaces a document directly into the storage engine.

This is a low level route intended to bypass Kuzzle actions on document creation, notably:
  - check [document validity](/core/2/guides/advanced/data-validation),
  - add [kuzzle metadata](/core/2/guides/main-concepts/data-storage#kuzzle-metadata),
  - trigger [realtime notifications](/core/2/guides/main-concepts/realtime-engine) (unless asked otherwise).

<br/>

```js
write (index, collection, document, [id], [options])
```

<br/>

| Argument     | Type              | Description          |
| ------------ | ----------------- | -------------------- |
| `index`      | <pre>string</pre> | Index name           |
| `collection` | <pre>string</pre> | Collection name      |
| `document`   | <pre>object</pre> | Document content     |
| `id`         | <pre>string</pre> | Optional document ID |
| `options`    | <pre>object</pre> | Query options        |

### options

Additional query options

| Property   | Type<br/>(default)               | Description                                                                                                           |
| ---------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`)  | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| `notify`   | <pre>boolean</pre><br/>(`false`) | if set to true, Kuzzle will trigger realtime notifications                                                            |
| `refresh`  | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                    |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

---

## Resolves

Resolves to an object containing the document creation result.

| Name       | Type              | Description                                            |
| ---------- | ----------------- | ------------------------------------------------------ |
| `_id`      | <pre>string</pre> | ID of the newly created document                       |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Created document                                       |

## Usage

<<< ./snippets/write.js
