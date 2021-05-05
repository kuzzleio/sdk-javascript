---
code: true
type: page
title: mUpsert
description: Update documents
---

# mUpsert

<SinceBadge version="Kuzzle 2.11.0"/>
<SinceBadge version="auto-version"/>

Applies partial changes to multiple documents. If a document doesn't already exist, a new document is created.

You can set the `retryOnConflict` optional argument (with a retry count), to tell Kuzzle to retry the failing updates the specified amount of times before rejecting the request with an error.

<br/>

```js
mUpsert(index, collection, documents, [options]);
```

| Argument     | Type                | Description                  |
|--------------|---------------------|------------------------------|
| `index`      | <pre>string</pre>   | Index name                   |
| `collection` | <pre>string</pre>   | Collection name              |
| `documents`  | <pre>object[]</pre> | Array of documents to update |
| `options`    | <pre>object</pre>   | Query options                |


### documents

`documents` is an array of object which each object representing a document. Fields `_id` and `changes` is always mandatory while `default` is optional.
Example:

```js
[
  {
    "_id": "<documentId>",
    "changes": {
      // document partial changes
    },
    "default": {
      // optional: document fields to add to the "update" part if the document
      // is created
    }
  },
  {
    "_id": "<anotherDocumentId>",
    "changes": {
      // document partial changes
    },
  }
]
```

### Options

Additional query options

| Options           | Type<br/>(default)               | Description                                                                              |
|-------------------|----------------------------------|------------------------------------------------------------------------------------------|
| `queuable`        | <pre>boolean</pre><br/>(`true`)  | If true, queues the request during downtime, until connected to Kuzzle again             |
| `refresh`         | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)       |
| `retryOnConflict` | <pre>int</pre><br/>(`0`)         | The number of times the database layer should retry in case of version conflict          |
| `silent`          | <pre>boolean</pre><br/>(`false`) | If `true`, then Kuzzle will not generate notifications <SinceBadge version="7.5.3"/> |

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

Each updated document is an object of the `successes` array with the following properties:

| Name       | Type              | Description                                            |
|------------|-------------------|--------------------------------------------------------|
| `_id`      | <pre>string</pre> | Document ID                                            |
| `status`   | <pre>number</pre> | HTTP error status             |
| `created`  | <pre>boolean</pre>| `true` if the document has been created |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Document content                                       |

Each errored document is an object of the `errors` array with the following properties:

| Name       | Type              | Description                   |
|------------|-------------------|-------------------------------|
| `document` | <pre>object</pre> | Document that cause the error |
| `status`   | <pre>number</pre> | HTTP error status             |
| `reason`   | <pre>string</pre> | Human readable reason         |

## Usage

<<< ./snippets/m-upsert.js
