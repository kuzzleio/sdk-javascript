---
code: true
type: page
title: mUpdate
description: Update documents
---

# mUpdate

Updates multiple documents.

Returns a partial error (error code 206) if one or more documents can not be updated.

Conflicts may occur if the same document gets updated multiple times within a short timespan in a database cluster.

You can set the `retryOnConflict` optional argument (with a retry count), to tell Kuzzle to retry the failing updates the specified amount of times before rejecting the request with an error.

<br/>

```javascript
mUpdate(index, collection, documents, [options]);
```

| Argument     | Type            | Description                  |
| ------------ | --------------- | ---------------------------- |
| `index`      | `string`        | Index name                   |
| `collection` | `string`        | Collection name              |
| `documents`  | `array<object>` | Array of documents to update |
| `options`    | `object`        | Query options                |

### Options

Additional query options

| Options           | Type<br/>(default)     | Description                                                                        |
| ----------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `queuable`        | `boolean`<br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`         | `string`<br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |
| `retryOnConflict` | `int`<br/>(`0`)        | The number of times the database layer should retry in case of version conflict    |

## Resolves

Resolves to an object containing the updated documents.

| Property | Type            | Description             |
| -------- | --------------- | ----------------------- |
| `hits`   | `array<object>` | Updated documents       |
| `total`  | `number`        | Total updated documents |

## Usage

<<< ./snippets/m-update.js
