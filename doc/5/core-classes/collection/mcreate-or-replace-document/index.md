---
code: false
type: page
title: mcreateOrReplaceDocument
description: Collection:mcreateOrReplaceDocument
---

# mCreateOrReplaceDocument

Create or replace the input [Documents](/sdk/js/5/core-classes/document/).

---

## mCreateOrReplaceDocument(documents, [options], [callback])

| Arguments   | Type        | Description                                                   |
| ----------- | ----------- | ------------------------------------------------------------- |
| `documents` | Document[]  | Array of [Document](/sdk/js/5/core-classes/document/) to create or replace |
| `options`   | JSON Object | Optional parameters                                           |
| `callback`  | function    | Optional callback                                             |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `Collection` object to allow chaining.

---

## Callback Response

Returns a `JSON object` containing the raw Kuzzle response.
Can return a 206 partial error in cases where some documents could not be created or replaced.

## Usage

<<< ./snippets/mcreate-or-replace-document-1.js

> Callback response:

```json
{
  "hits": [{ "first": "document" }, { "second": "document" }],
  "total": 2
}
```
