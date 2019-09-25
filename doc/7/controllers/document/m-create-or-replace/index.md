---
code: true
type: page
title: mCreateOrReplace
description: Create or replace documents
---

# mCreateOrReplace

Creates or replaces multiple documents.

<br/>

```js
mCreateOrReplace(index, collection, documents, [options]);
```

| Argument     | Type            | Description                  |
| ------------ | --------------- | ---------------------------- |
| `index`      | <pre>string</pre>        | Index name                   |
| `collection` | <pre>string</pre>        | Collection name              |
| `documents`  | <pre>array<object></pre> | Array of documents to create |
| `options`    | <pre>object</pre>        | Query options                |

### Options

Additional query options

| Options    | Type<br/>(default)     | Description                                                                        |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | `string`<br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

Each created or replaced document is an object of the `successes` array with the following properties:

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `_id`      | <pre>string</pre> | Document ID                     |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Document content                                       |
| `created`  | <pre>boolean</pre> | True if the document was created |

Each errored document is an object of the `errors` array with the following properties:

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `document`  | <pre>object</pre> | Document that cause the error                                       |
| `status` | <pre>number</pre> | HTTP error status |
| `reason`  | <pre>string</pre> | Human readable reason |

## Usage

<<< ./snippets/m-create-or-replace.js
