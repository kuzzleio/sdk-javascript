---
code: true
type: page
title: write
description: Create or replace a document directly into the storage engine.
---

# write

<SinceBadge version="6.1.5" />

<SinceBadge version="Kuzzle 1.8.0" />

Create or replace a document directly into the storage engine.

This is a low level route intended to bypass Kuzzle actions on document creation, notably:
  - check [document validity](/core/1/guides/essentials/data-validation),
  - add [kuzzle metadata](/core/1/guides/essentials/document-metadata),
  - trigger [realtime notifications](/core/1/guides/essentials/real-time) (unless asked otherwise).

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

| Property   | Type<br/>(default)              | Description        |
| ---------- | ------------------------------- | ------------------ |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `notify` | <pre>boolean</pre><br/>(`false`) | if set to true, Kuzzle will trigger realtime notifications |
| `refresh`  | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

---

## Resolves

Resolves to an object containing the document creation result.

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| \_id      | <pre>string</pre> | ID of the newly created document                       |
| \_version | <pre>number</pre> | Version of the document in the persistent data storage |
| \_source  | <pre>object</pre> | Created document                         

## Usage

<<< ./snippets/write.js
