---
code: true
type: page
title: createOrReplace
description: Creates or replaces a document
---

# createOrReplace

Creates a new document in the persistent data storage, or replaces its content if it already exists.

The optional parameter `refresh` can be used with the value `wait_for` in order to wait for the document to be indexed (indexed documents are available for `search`).

<br/>

```javascript
createOrReplace(index, collection, id, document, [options]);
```

| Argument     | Type              | Description      |
| ------------ | ----------------- | ---------------- |
| `index`      | <pre>string</pre> | Index name       |
| `collection` | <pre>string</pre> | Collection name  |
| `id`         | <pre>string</pre> | Document ID      |
| `document`   | <pre>object</pre> | Document content |
| `options`    | <pre>object</pre> | Query options    |

### **Options**

Additional query options

| Options    | Type<br/>(default)              | Description                                                                        |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Resolves to an object containing the document creation result.

| Name      | Type              | Description                                                |
| --------- | ----------------- | ---------------------------------------------------------- |
| \_id      | <pre>string</pre> | The id of the newly created document                       |
| \_version | <pre>number</pre> | The version of the document in the persistent data storage |
| \_source  | <pre>object</pre> | The created document                                       |

## Usage

<<< ./snippets/create-or-replace.js
