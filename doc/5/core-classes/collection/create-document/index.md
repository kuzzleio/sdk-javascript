---
code: false
type: page
title: createDocument
description: Collection:createDocument
---

# createDocument

Create a new document in Kuzzle and instantiate a [Document](/sdk/js/5/core-classes/document/) object.

---

## createDocument(Document, [options], [callback])

| Arguments  | Type        | Description                            |
| ---------- | ----------- | -------------------------------------- |
| `Document` | object      | [Document](/sdk/js/5/core-classes/document/) object |
| `options`  | JSON object | Optional parameters                    |
| `callback` | function    | Optional callback                      |

---

## createDocument([id], content, [options], [callback])

| Arguments  | Type        | Description                       |
| ---------- | ----------- | --------------------------------- |
| `id`       | string      | Optional document identifier      |
| `content`  | JSON object | Content of the document to create |
| `options`  | JSON object | Optional parameters               |
| `callback` | function    | Optional callback                 |

---

## Options

| Option     | Type        | Description                                                                                                                      | Default     |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `volatile` | JSON object | Additional information passed to notifications to other users                                                                    | `null`      |
| `queuable` | boolean     | Make this request queuable or not                                                                                                | `true`      |
| `refresh`  | string      | If set to `wait_for`, Kuzzle will wait for the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |
| `ifExist`  | string      | If the same document already exists: resolves to an `error`. Replaces the existing document if set to `replace`                  | `false`     |

---

## Return Value

Returns the `Collection` object to allow chaining.

---

## Callback Response

Returns a [Document](/sdk/js/5/core-classes/document/) object containing the newly created document.

## Usage

<<< ./snippets/create-document-1.js
