---
code: false
type: page
title: replaceDocument
description: Collection:replaceDocument
---

# replaceDocument

Replace an existing document and return the updated version as a [Document](/sdk/js/5/core-classes/document/) object.

---

## replaceDocument(documentId, content, [options], [callback])

| Arguments    | Type        | Description                       |
| ------------ | ----------- | --------------------------------- |
| `documentId` | string      | Unique document identifier        |
| `content`    | JSON Object | Content of the document to create |
| `options`    | JSON Object | Optional parameters               |
| `callback`   | function    | Optional callback                 |

---

## Options

| Option     | Type        | Description                                                                                                                      | Default     |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `volatile` | JSON Object | Additional information passed to notifications to other users                                                                    | `null`      |
| `queuable` | boolean     | Make this request queuable or not                                                                                                | `true`      |
| `refresh`  | string      | If set to `wait_for`, Kuzzle will wait for the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |

---

## Return Value

Returns the `Collection` object to allow chaining.

---

## Callback Response

Returns an updated [Document](/sdk/js/5/core-classes/document/) object.

## Usage

<<< ./snippets/replace-document-1.js
