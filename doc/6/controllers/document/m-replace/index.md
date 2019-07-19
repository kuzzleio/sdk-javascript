---
code: true
type: page
title: mReplace
description: Replace documents
---

# mReplace

Replaces multiple documents.

Throws a partial error (error code 206) if one or more documents can not be replaced.

<br/>

```js
mReplace(index, collection, documents, [options]);
```

| Argument     | Type            | Description                  |
| ------------ | --------------- | ---------------------------- |
| `index`      | `string`        | Index name                   |
| `collection` | `string`        | Collection name              |
| `documents`  | `array<object>` | Array of documents to update |
| `options`    | `object`        | Query options                |

### Options

Additional query options

| Options    | Type<br/>(default)     | Description                                                                        |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | `boolean`<br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | `string`<br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Resolves to an object containing the replaced documents.

| Property | Type            | Description              |
| -------- | --------------- | ------------------------ |
| `hits`   | `array<object>` | Replaced documents       |
| `total`  | `number`        | Total replaced documents |

## Usage

<<< ./snippets/m-replace.js
