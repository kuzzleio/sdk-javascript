---
code: false
type: page
title: deleteDocument
description: Collection:deleteDocument
---

# deleteDocument

Delete a stored document, or all stored documents matching a search filter.

<div class="alert alert-info">
There is a small delay between the time a document is deleted and it being reflected in the search layer (usually a couple of seconds). That means that a document that was just deleted may still be returned by this function at first.
</div>

---

## deleteDocument(documentId, [options], [callback])

| Arguments    | Type        | Description                |
| ------------ | ----------- | -------------------------- |
| `documentId` | string      | Unique document identifier |
| `options`    | JSON object | Optional parameters        |
| `callback`   | function    | Optional callback          |

---

## deleteDocument(filters, [options], [callback])

| Arguments  | Type        | Description                                                                                                             |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `filters`  | JSON object | Filters in [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/5.x/query-dsl.html) format |
| `options`  | JSON object | Optional parameters                                                                                                     |
| `callback` | function    | Optional callback                                                                                                       |

---

## Options

| Option     | Type        | Description                                                                                                                      | Default     |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `volatile` | JSON object | Additional information passed to notifications to other users                                                                    | `null`      |
| `queuable` | boolean     | Make this request queuable or not                                                                                                | `true`      |
| `refresh`  | string      | If set to `wait_for`, Kuzzle will wait for the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |

---

## Return Value

Returns the `Collection` object to allow chaining.

---

## Callback Response

Returns an `array` containing the ids of the deleted documents.

## Usage

<<< ./snippets/delete-document-1.js

> Callback response:

```json
["AVCoeBkimsySTKTfa8AX"]
```
