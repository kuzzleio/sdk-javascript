---
code: true
type: page
title: update
description: Update a document
---

# update

Updates a document content.

Conflicts may occur if the same document gets updated multiple times within a short timespan, in a database cluster.
You can set the `retryOnConflict` optional argument (with a retry count), to tell Kuzzle to retry the failing updates the specified amount of times before rejecting the request with an error.

<br/>

```js
update(index, collection, id, document, [options]);
```

| Argument     | Type              | Description                               |
| ------------ | ----------------- | ----------------------------------------- |
| `index`      | <pre>string</pre> | Index name                                |
| `collection` | <pre>string</pre> | Collection name                           |
| `id`         | <pre>string</pre> | Document ID                               |
| `document`   | <pre>object</pre> | Partial content of the document to update |
| `options`    | <pre>object</pre> | Query options                             |

### Options

Additional query options

| Options           | Type<br/>(default)              | Description                                                                        |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `queuable`        | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`         | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |
| `retryOnConflict` | <pre>int</pre><br/>(`0`)        | The number of times the database layer should retry in case of version conflict    |

## Resolves

Resolves to an object containing the the document update result.

## Usage

<<< ./snippets/update.js
