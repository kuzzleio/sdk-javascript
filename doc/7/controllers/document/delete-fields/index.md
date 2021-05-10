---
code: true
type: page
title: deleteFields
description: Deletes fields of an existing document.
---

# delete

Deletes fields of an existing document.

The optional parameter `refresh` can be used with the value `wait_for` in order to wait for the document to be indexed (and to no longer be available in search).

<br/>

```js
deleteFields (index, collection, id, fields, [options]);
```

| Argument     | Type                | Description                                                        |
| ------------ | ------------------- | ------------------------------------------------------------------ |
| `index`      | <pre>string</pre>   | Index name                                                         |
| `collection` | <pre>string</pre>   | Collection name                                                    |
| `id`         | <pre>string</pre>   | Document ID                                                        |
| `fields`     | <pre>string[]</pre> | [Path](https://lodash.com/docs/4.17.15#toPath) of fields to delete |
| `options`    | <pre>object</pre>   | Query options                                                      |

### Options

Additional query options

| Options    | Type<br/>(default)               | Description                                                                          |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| `queuable` | <pre>boolean</pre><br/>(`true`)  | If true, queues the request during downtime, until connected to Kuzzle again         |
| `refresh`  | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)   |
| `silent`   | <pre>boolean</pre><br/>(`false`) | If `true`, then Kuzzle will not generate notifications <SinceBadge version="7.5.3"/> |
| `source`   | <pre>boolean</pre><br/>(`false`) | If `true`, then the response will contain the updated document                       |

## Resolves

Resolves to updated document.

## Usage

<<< ./snippets/deleteFields.js
