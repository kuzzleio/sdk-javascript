---
code: false
type: page
title: updateDocument
description: Collection:updateDocument
---

# updateDocument

Update parts of a document, by replacing some fields or adding new ones.
Note that you cannot remove fields this way: missing fields will simply be left unchanged.

---

## updateDocument(documentId, content, [options], [callback])

| Arguments    | Type        | Description                       |
| ------------ | ----------- | --------------------------------- |
| `documentId` | string      | Unique document identifier        |
| `content`    | JSON object | Content of the document to create |
| `options`    | JSON object | Optional parameters               |
| `callback`   | function    | Optional callback                 |

---

## Options

| Option            | Type        | Description                                                                                                                  | Default     |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `volatile`        | JSON object | Additional information passed to notifications to other users                                                                | `null`      |
| `queuable`        | boolean     | Make this request queuable or not                                                                                            | `true`      |
| `refresh`         | string      | If set to `wait_for`, Kuzzle will wait the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |
| `retryOnConflict` | int         | Number of retries to attempt before rejecting this update because of a cluster sync conflict                                 | `0`         |

---

## Return Value

Returns the `Collection` object to allow chaining.

---

## Callback Response

Returns an up-to-date [Document](/sdk/js/5/core-classes/document/) object.

## Usage

<<< ./snippets/update-document-1.js
