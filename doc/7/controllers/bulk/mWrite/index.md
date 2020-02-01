---
code: true
type: page
title: mWrite
description: Creates or replaces multiple documents directly into the storage engine.
---

# mWrite

<SinceBadge version="6.2.0" />

<SinceBadge version="Kuzzle 1.8.0" />

Creates or replaces multiple documents directly into the storage engine.

This is a low level route intended to bypass Kuzzle actions on document creation, notably:
  - check [document validity](/core/2/guides/essentials/data-validation),
  - add [kuzzle metadata](/core/2/guides/essentials/document-metadata),
  - trigger [realtime notifications](/core/2/guides/essentials/real-time) (unless asked otherwise)

<br/>

```js
mWrite (index, collection, documents, [options])
```

<br/>

| Argument     | Type              | Description          |
| ------------ | ----------------- | -------------------- |
| `index`      | <pre>string</pre> | Index name           |
| `collection` | <pre>string</pre> | Collection name      |
| `documents`   | <pre>object[]</pre> | Array of objects representing the documents     |
| `options`    | <pre>object</pre> | Query options        |

### documents

An array of objects. Each object describes a document to create or replace, by exposing the following properties:
  - `_id`: document unique identifier (optional)
  - `body`: document content

### options

Additional query options

| Property   | Type<br/>(default)              | Description        |
| ---------- | ------------------------------- | ------------------ |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `notify` | <pre>boolean</pre><br/>(`false`) | if set to true, Kuzzle will trigger realtime notifications |
| `refresh`  | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

---

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

Each created or replaced document is an object of the `successes` array with the following properties:

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `_id`      | <pre>string</pre> | Document ID                     |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Document content                                       |
| `created`  | <pre>boolean</pre> | True if the document was created |

Each errored document is an object of the `errors` array with the following properties:

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `document`  | <pre>object</pre> | Document that cause the error                                       |
| `status` | <pre>number</pre> | HTTP error status |
| `reason`  | <pre>string</pre> | Human readable reason |

## Usage

<<< ./snippets/mWrite.js
