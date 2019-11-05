---
code: true
type: page
title: mReplace
description: Replace documents
---

# mReplace

Replaces multiple documents.

<br/>

```js
mReplace(index, collection, documents, [options]);
```

| Argument     | Type            | Description                  |
| ------------ | --------------- | ---------------------------- |
| `index`      | <pre>string</pre>        | Index name                   |
| `collection` | <pre>string</pre>        | Collection name              |
| `documents`  | <pre>object[]</pre> | Array of documents to update |
| `options`    | <pre>object</pre>        | Query options                |

### Options

Additional query options

| Options    | Type<br/>(default)     | Description                                                                        |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

Each replaced document is an object of the `successes` array with the following properties:

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `_id`      | <pre>string</pre> | Document ID                     |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Document content                                       |

Each errored document is an object of the `errors` array with the following properties:

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `document`  | <pre>object</pre> | Document that cause the error                                       |
| `status` | <pre>number</pre> | HTTP error status |
| `reason`  | <pre>string</pre> | Human readable reason |

## Usage

<<< ./snippets/m-replace.js
