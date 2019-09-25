---
code: true
type: page
title: mDelete
description: Delete documents
---

# mDelete

Deletes multiple documents.

The optional parameter `refresh` can be used with the value `wait_for` in order to wait for the document indexation (indexed documents are available for `search`).

<br/>

```js
mDelete(index, collection, ids, [options]);
```

| Argument     | Type            | Description                    |
| ------------ | --------------- | ------------------------------ |
| `index`      | <pre>string</pre>        | Index name                     |
| `collection` | <pre>string</pre>        | Collection name                |
| `ids`        | <pre>array<string></pre> | IDs of the documents to delete |
| `options`    | <pre>object</pre>        | Query options                  |

### Options

Additional query options

| Options    | Type<br/>(default)     | Description                                                                        |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | `string`<br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

The `successes` array contain the successfuly deleted document IDs.

Each deletion error is an object of the `errors` array with the following properties:

| Name      | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `id`  | <pre>object</pre> | Document ID                                      |
| `reason`  | <pre>string</pre> | Human readable reason |

## Usage

<<< ./snippets/m-delete.js
