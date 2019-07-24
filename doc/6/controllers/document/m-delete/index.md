---
code: true
type: page
title: mDelete
description: Delete documents
---

# mDelete

Deletes multiple documents.

Throws a partial error (error code 206) if one or more document deletions fail.

The optional parameter `refresh` can be used with the value `wait_for` in order to wait for the document indexation (indexed documents are available for `search`).

<br/>

```js
mDelete(index, collection, ids, [options]);
```

| Argument     | Type            | Description                    |
| ------------ | --------------- | ------------------------------ |
| `index`      | `string`        | Index name                     |
| `collection` | `string`        | Collection name                |
| `ids`        | `array<string>` | IDs of the documents to delete |
| `options`    | `object`        | Query options                  |

### Options

Additional query options

| Options    | Type<br/>(default)     | Description                                                                        |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | `boolean`<br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | `string`<br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Resolves to an array of objects representing the deleted documents.

## Usage

<<< ./snippets/m-delete.js
