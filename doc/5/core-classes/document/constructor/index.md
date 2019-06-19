---
code: false
type: page
title: constructor
description: Document:constructor
order: 1
---

# Document

Kuzzle handles two types of documents: realtime messages and stored documents. Document is the object representation of one of these document types.

---

## Document(Collection, [documentId], [content])

| Arguments    | Type        | Description                                         |
| ------------ | ----------- | --------------------------------------------------- |
| `Collection` | object      | An instantiated Collection object                   |
| `content`    | JSON Object | Initializes this document with the provided content |
| `documentId` | string      | ID of an existing document.                         |

**Note:** this constructor won't make any call to Kuzzle. When providing only a document ID, the `refresh` method should be called to retrieve the corresponding document content.

---

## Properties

| Property name | Type        | Description                                     | get/set |
| ------------- | ----------- | ----------------------------------------------- | ------- |
| `collection`  | string      | The collection associated to this document | get     |
| `content`     | JSON Object | The content of the document                     | get/set |
| `headers`     | JSON Object | Common headers for all sent documents.          | get/set |
| `id`          | string      | Unique document identifier                      | get/set |
| `meta`        | JSON Object | Document metadata                               | get     |
| `version`     | integer     | Current document version                        | get     |

**Notes:**

- setting a new value to the `content` property is equivalent to calling `setContent(data, false)`
- setting a new value to the `id` property will force this value for this document
- the `headers` property is inherited from the provided `Collection` object and can be overrided

## Usage

<<< ./snippets/constructor-1.js
