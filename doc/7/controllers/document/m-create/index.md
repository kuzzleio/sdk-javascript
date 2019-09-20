---
code: true
type: page
title: mCreate
description: Create multiple documents in kuzzle
---

# mCreate

Creates multiple documents.

Throws a partial error (error code 206) if one or more documents creations fail.

<br/>

```js
mCreate(index, collection, documents, [options]);
```

| Argument     | Type            | Description                  |
| ------------ | --------------- | ---------------------------- |
| `index`      | `string`        | Index name                   |
| `collection` | `string`        | Collection name              |
| `documents`  | `array<object>` | Array of documents to create |
| `options`    | `object`        | Query options                |

### Options

Additional query options

| Options    | Type<br/>(default)     | Description                                                                        |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | `boolean`<br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | `string`<br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Resolves to an object containing created documents.

| Property | Type            | Description                       |
| -------- | --------------- | --------------------------------- |
| `hits`   | `array<object>` | Created documents                 |
| `total`  | `number`        | Total number of created documents |

## Usage

<<< ./snippets/m-create.js
