---
code: true
type: page
title: mGet
description: Get multiple documents
---

# mGet

Gets multiple documents.

Throws a partial error (error code 206) if one or more document can not be retrieved.

<br/>

```javascript
mGet(index, collection, ids, [options]);
```

| Argument     | Type            | Description     |
| ------------ | --------------- | --------------- |
| `index`      | `string`        | Index name      |
| `collection` | `string`        | Collection name |
| `ids`        | `array<string>` | Document ids    |
| `options`    | `object`        | Query options   |

### Options

Additional query options

| Options    | Type<br/>(default)     | Description                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------------- |
| `queuable` | `boolean`<br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves to an object containing the retrieved documents.

| Property | Type            | Description               |
| -------- | --------------- | ------------------------- |
| `hits`   | `array<object>` | Retrieved documents       |
| `total`  | `number`        | Total retrieved documents |

## Usage

<<< ./snippets/m-get.js
