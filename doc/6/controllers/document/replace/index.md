---
code: true
type: page
title: replace
description: Replace a document
---

# replace

Replaces the content of an existing document.

<br/>

```js
replace(index, collection, id, document, [options]);
```

| Argument     | Type              | Description                           |
| ------------ | ----------------- | ------------------------------------- |
| `index`      | <pre>string</pre> | Index name                            |
| `collection` | <pre>string</pre> | Collection name                       |
| `id`         | <pre>string</pre> | Document ID                           |
| `document`   | <pre>object</pre> | New content of the document to update |
| `options`    | <pre>object</pre> | Query options                         |

### Options

Additional query options

| Options    | Type<br/>(default)              | Description                                                                        |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Resolves to an object containing the the document update result.

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| \_id      | <pre>string</pre> | ID of the newly created document                       |
| \_version | <pre>number</pre> | Version of the document in the persistent data storage |
| \_source  | <pre>object</pre> | The updated document                                   |

## Usage

<<< ./snippets/replace.js
