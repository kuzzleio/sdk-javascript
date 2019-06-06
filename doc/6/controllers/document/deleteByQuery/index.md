---
code: true
type: page
title: deleteByQuery
description: Delete documents matching query
---

# deleteByQuery

Deletes documents matching the provided search query.

Kuzzle uses the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/query-dsl.html) syntax.

An empty or null query will match all documents in the collection.

<br/>

```javascript
deleteByQuery(index, collection, [query], [options]);
```

| Argument     | Type              | Description     |
| ------------ | ----------------- | --------------- |
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `query`      | <pre>object</pre> | Query to match  |
| `options`    | <pre>object</pre> | Query options   |

### Options

Additional query options

| Options    | Type<br/>(default)              | Description                                                                        |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Resolves to an array of strings containing the deleted document ids.

## Usage

<<< ./snippets/delete-by-query.js
