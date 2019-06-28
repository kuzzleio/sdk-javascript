---
code: false
type: page
title: mdeleteDocument
description: Collection:mdeleteDocument
---

# mDeleteDocument

Delete multiple [Documents](/sdk/js/5/core-classes/document/) according to the input IDs.

---

## mDeleteDocument(documentIds, [options], callback)

| Arguments     | Type        | Description                         |
| ------------- | ----------- | ----------------------------------- |
| `documentIds` | String[]    | Array of IDs of documents to delete |
| `options`     | JSON Object | Optional parameters                 |
| `callback`    | function    | Callback handling the response      |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a `JSON object` containing the raw Kuzzle response.
Can return a 206 partial error in cases where some documents could not be deleted.

## Usage

<<< ./snippets/mdelete-document-1.js

> Callback response:

```json
["doc1", "doc2"]
```
